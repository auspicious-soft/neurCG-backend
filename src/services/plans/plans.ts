import stripe from "src/configF/stripe";
import { Response } from "express";
import { usersModel } from "src/models/user/user-schema";
import { errorResponseHandler } from "src/lib/errors/error-response-handler";
import { httpStatusCode } from "src/lib/constant";
import { IncomeModel } from "src/models/admin/income-schema";
import mongoose from "mongoose";
import Stripe from "stripe";

interface Payload {
    id: string;
    planType: 'free' | 'intro' | 'pro';
}

const priceIdsMap = {
    'free': process.env.STRIPE_PRICE_FREE as string,
    'intro': process.env.STRIPE_PRICE_INTRO as string,
    'pro': process.env.STRIPE_PRICE_PRO as string
};


const creditCounts = {
    'free': 3,
    'intro': 100,
    'pro': 300
}

// TO create checkout session id to give to frontend
export const buyPlanService = async (payload: Payload, res: Response) => {
    const { planType, id } = payload
    const priceId = priceIdsMap[planType];
    if (!priceId) return errorResponseHandler("Invalid plan type", httpStatusCode.BAD_REQUEST, res)
    const metadata = {
        userId: id,
        planType
    }
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `http://localhost:3001`,                                                   // Change to your success URL
            cancel_url: `http://localhost:3001/plans`,   // Change to your cancel URL
            metadata
        });
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
    const userId = session.metadata.userId;                                                    // Ensure you're sending this when creating the session
    const planType: 'free' | 'intro' | 'pro' = session.metadata.planType                      // Ensure you're sending this when creating the session
    const subs = await stripe.subscriptions.retrieve(session.subscription)
    const creditsToAdd = creditCounts[planType]

    switch (event.type) {
        case 'checkout.session.completed':
            const result = await usersModel.findByIdAndUpdate(userId, { $inc: { creditsLeft: creditsToAdd }, planType, planOrSubscriptionId: subs.id }, { new: true, session: transaction });
            await IncomeModel.create([{
                userId,
                userName: result?.firstName + ' ' + result?.lastName,
                planType,
                planOrSubscriptionId: subs.id,
                // stripeCustomerId: subs.customer,
                planAmount: await getPriceAmountByPriceId(priceIdsMap[planType]),
                monthYear: new Date().toISOString().slice(0, 7)
            }], { session: transaction });

            await transaction.commitTransaction()
            return { success: true, message: `User ${userId} has been credited with ${creditsToAdd} credits for plan ${planType}`, data: result }

        case 'invoice.paid':
            const invoiceResult = await usersModel.findByIdAndUpdate(userId, { $inc: { creditsLeft: creditsToAdd }, planType, planOrSubscriptionId: subs.id }, { new: true, session: transaction })

            await IncomeModel.create([{
                userId,
                userName: invoiceResult?.firstName + ' ' + invoiceResult?.lastName,
                planType,
                planOrSubscriptionId: subs.id,
                planAmount: await getPriceAmountByPriceId(priceIdsMap[planType]),
                monthYear: new Date().toISOString().slice(0, 7)
            }], { session: transaction })
            await transaction.commitTransaction()
            return { success: true, message: `User ${userId} has been credited with ${creditsToAdd} credits for plan ${planType}`, data: invoiceResult }

        default:
            console.log(`Unhandled event type ${event.type}`)
            return { success: false, message: `Unhandled event type ${event.type}` }
    }
}

export const cancelSubscriptionService = async (payload: any, res: Response<any, Record<string, any>>) => {
    const { subscriptionId, id } = payload;
    try {
        // Cancel the subscription in Stripe
        await stripe.subscriptions.cancel(subscriptionId, { cancellation_details: { comment: 'User cancelled his subscription' } })
        // update(subscriptionId, { cancel_at_period_end: true });
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
