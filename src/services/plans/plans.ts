import stripe from "src/configF/stripe";
import { Response } from "express";
import { usersModel } from "src/models/user/user-schema";
import { errorResponseHandler } from "src/lib/errors/error-response-handler";
import { creditCounts, httpStatusCode, priceIdsMap, yearlyCreditCounts, yearlyPriceIdsMap } from "src/lib/constant";
import { IncomeModel } from "src/models/admin/income-schema";
import mongoose from "mongoose";
import Stripe from "stripe";
import { notificationsModel } from "src/models/admin/notification-schema";
import { IdempotencyKeyModel } from "src/models/idempotency-schema";
import { v4 as uuidv4 } from 'uuid';

interface Payload {
    id: string;
    planType: 'free' | 'intro' | 'pro'
    interval?: 'month' | 'year'
}

// TO create checkout session id to give to frontend
export const buyPlanService = async (payload: Payload, res: Response) => {
    const { planType, id, interval = 'month' } = payload
    const priceId = interval == 'month' ? priceIdsMap[planType] : yearlyPriceIdsMap[planType as 'intro' | 'pro']
    if (!priceId) return errorResponseHandler("Invalid plan type", httpStatusCode.BAD_REQUEST, res)
    const idempotencyKey = uuidv4()

    const metadata = {
        userId: id,
        planType,
        idempotencyKey, // Store the key in metadata for reference
    }
    try {
        const originalAmount = await getPriceAmountByPriceId(priceId)
        let unitAmount = originalAmount
        if (interval === 'year') {
            const discount = (originalAmount * 0.05)
            unitAmount = originalAmount - discount
        }
        const session = await stripe.checkout.sessions.create({
            // payment_method_types: ['card', 'amazon_pay'],
            line_items: [{
                // price: priceId,  either this or the below price_data
                quantity: 1,
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: planType[0].toUpperCase() + planType.slice(1) + ' Plan',
                        ...(interval === 'year' && { description: '5% discount applied' })
                    },
                    unit_amount: unitAmount,
                    recurring: {
                        interval
                    }
                }
            }],
            mode: 'subscription',
            success_url: process.env.STRIPE_FRONTEND_SUCCESS_CALLBACK as string,         // Change to your success URL
            cancel_url: process.env.STRIPE_FRONTEND_CANCEL_CALLBACK as string,   // Change to your cancel URL
            metadata,
            subscription_data: {   //Very imp to remember the subs. to be remembered for later invoicing
                metadata: {
                    userId: id,
                    planType,
                    idempotencyKey
                }
            }
        },
            {
                idempotencyKey // Pass idempotency key to Stripe
            })
        return {
            id: session.id,
            success: true,
        }
    } catch (error) {
        console.log('error: ', error);
    }

}


export const updateUserCreditsAfterSuccessPaymentService = async (payload: any, transaction: mongoose.mongo.ClientSession, res: Response<any, Record<string, any>>) => {
    const sig = payload.headers['stripe-signature'];
    let checkSignature: Stripe.Event;
    try {
        checkSignature = stripe.webhooks.constructEvent(payload.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (err: any) {
        console.log(`❌ Error message: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return
    } 
    // console.log('✅ Success:', checkSignature.id);
    const event = payload.body
    const session = event.data.object;
    let idempotentKey = session.metadata?.idempotencyKey;

    if (!idempotentKey && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        idempotentKey = subscription.metadata?.idempotencyKey || "defaultKey"; // Fallback to "defaultKey" if still undefined
    }
    const existingEvent = await IdempotencyKeyModel.findOne({
        $or: [
            { eventId: event.id },
            { key: idempotentKey }
        ]
    })
    if (existingEvent) { 
        // console.log(`Event ${event.id} or session with idempotency key ${idempotentKey} has already been processed.`);
        await IdempotencyKeyModel.findByIdAndUpdate(existingEvent._id, { $set: { processed: true, processedAt: new Date() } })
        return { success: true, message: 'Event already processed' };
    }
    if (event.id) {
        await IdempotencyKeyModel.findOneAndUpdate(
            { key: idempotentKey },
            {
                $set: {
                    eventId: event.id,
                    processed: true,
                    processedAt: new Date()
                }
            },
            { upsert: true }
        )
    }

    let userId                                    // Ensure you're sending this when creating the session
    let planType: 'free' | 'intro' | 'pro'                // Ensure you're sending this when creating the session
    const subs = await stripe.subscriptions.retrieve(session.subscription)
    const interval = await (subs as any).plan.interval
    console.log('event.type: ', event.type);
    switch (event.type) {
        case 'checkout.session.completed':
            userId = session.metadata.userId
            planType = session.metadata.planType
            const user = await usersModel.findById(userId)
            const planAmount = interval === 'month' ? await getPriceAmountByPriceId(priceIdsMap[planType]) : await getPriceAmountByPriceId(yearlyPriceIdsMap[planType as 'intro' | 'pro']) * 0.95;
            const creditsToAdd = interval == 'month' ? creditCounts[planType] : yearlyCreditCounts[planType as 'intro' | 'pro']
            const currentSubscriptionId = user?.planOrSubscriptionId
            if (currentSubscriptionId && currentSubscriptionId !== session.subscription) {
                const subscriptionExists = await stripe.subscriptions.retrieve(currentSubscriptionId)
                if (subscriptionExists) {
                    await stripe.subscriptions.cancel(currentSubscriptionId)
                }
            }
            const result = await usersModel.findByIdAndUpdate(userId, {
                $inc: { creditsLeft: creditsToAdd },
                planType,
                planOrSubscriptionId: session.subscription,
                planInterval: interval
            },
                {
                    new: true,
                    session: transaction
                })
            await IncomeModel.create([{
                userId,
                userName: result?.firstName + ' ' + result?.lastName,
                planType,
                planOrSubscriptionId: session.subscription,
                // stripeCustomerId: subs.customer,
                planAmount,
                planInterval: interval,
                monthYear: new Date().toISOString().slice(0, 7)
            }], { session: transaction })

            await transaction.commitTransaction()
            return { success: true, message: `User ${userId} has been credited with ${creditsToAdd} credits for plan ${planType}`, data: result }

        case 'invoice.paid':
            userId = subs.metadata.userId
            planType = subs.metadata.planType as 'intro' | 'pro'
            const planAmountInvoice = interval === 'month' ? await getPriceAmountByPriceId(priceIdsMap[planType]) : await getPriceAmountByPriceId(yearlyPriceIdsMap[planType as 'intro' | 'pro']) * 0.95;
            const creditsToAddInvoice = interval == 'month' ? creditCounts[planType] : yearlyCreditCounts[planType as 'intro' | 'pro']
            const invoiceResult = await usersModel.findByIdAndUpdate(userId, { $inc: { creditsLeft: creditsToAddInvoice }, planType, planOrSubscriptionId: session.subscription, planInterval: interval }, { new: true, session: transaction })

            await IncomeModel.create([{
                userId,
                userName: invoiceResult?.firstName + ' ' + invoiceResult?.lastName,
                planType,
                planOrSubscriptionId: session.subscription,
                planAmount: planAmountInvoice,
                monthYear: new Date().toISOString().slice(0, 7),
                planInterval: interval
            }], { session: transaction })
            await transaction.commitTransaction()
            return { success: true, message: `User ${userId} has been credited with ${creditsToAddInvoice} credits for plan ${planType}`, data: invoiceResult }
 
        case 'invoice.payment_failed':
            //SEND NOTIFICATION TO USER
            const userIdInvoiceFailed = subs.metadata.userId
            const planTypeInvoiceFailed = subs.metadata.planType as 'free' | 'intro' | 'pro'
            const sendNotification = await notificationsModel.create({
                userId: userIdInvoiceFailed,
                title: 'Payment Failed for your plan',
                message: `Your payment for ${planTypeInvoiceFailed} plan has failed. Please contact support.`,
                date: new Date()
            })
            console.log(`Payment failed notification sent to user ${userIdInvoiceFailed} for plan ${planTypeInvoiceFailed}.`)
            return { success: false, message: `Payment for ${planTypeInvoiceFailed} plan has failed.`, data: sendNotification }

        default:
            console.log(`Unhandled event type ${event.type}`)
            return { success: false, message: `Unhandled event type ${event.type}` }
    }
}

export const cancelSubscriptionService = async (payload: any, res: Response<any, Record<string, any>>) => {
    const { subscriptionId, id } = payload;
    try {
        // Cancel the subscription in Stripe
        await stripe.subscriptions.cancel(subscriptionId, { cancellation_details: { comment: 'User cancelled his subscription' } })   // update(subscriptionId, { cancel_at_period_end: true });
        const result = await usersModel.findByIdAndUpdate(id, { planType: 'expired', planOrSubscriptionId: null }, { new: true })

        return { success: true, message: `Subscription ${subscriptionId} has been canceled and user ${id}'s plan is now expired.`, data: result }

    }
    catch (error: any) {
        return errorResponseHandler(error.message, httpStatusCode.INTERNAL_SERVER_ERROR, res)
    }
}

//TO CREATE A PAYMENT INTENT

// export const buyPlanService = async (payload: Payload, res: Response) => {
//     const { planType, id: userId } = payload;

//     const priceId = priceIdsMap[planType];
//     if (!priceId) return res.status(400).json({ error: 'Invalid plan type' })

//     // Create a payment intent with the price ID
//     const paymentIntent = await stripe.paymentIntents.create({
//         amount: await getPriceAmountByPriceId(priceId),
//         currency: 'eur',
//         payment_method_types: ['card'],
//     })

//     // Update user's credit count after successful payment
//     const creditsToAdd = creditCounts[planType]
//     const updatedUser = await usersModel.findByIdAndUpdate(userId, { $inc: { creditsLeft: creditsToAdd } }, { new: true })

//     return { success: true, clientSecret: paymentIntent.client_secret, user: updatedUser }
// }


export const getPriceAmountByPriceId = async (priceId: string) => {
    const price = await stripe.prices.retrieve(priceId)
    return price.unit_amount ?? 0
}
