import stripe from "src/configF/stripe";
import { Response } from "express";
import { usersModel } from "src/models/user/user-schema";

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

export const buyPlanService = async (payload: Payload, res: Response) => {
    const { planType, id: userId } = payload;

    const priceId = priceIdsMap[planType];
    if (!priceId) return res.status(400).json({ error: 'Invalid plan type' })
    
    // Create a payment intent with the price ID
    const paymentIntent = await stripe.paymentIntents.create({
        amount: await getPriceAmountByPriceId(priceId),
        currency: 'eur',
        payment_method_types: ['card'],
    })

    // Update user's credit count after successful payment
    const creditsToAdd = creditCounts[planType]
    const updatedUser = await usersModel.findByIdAndUpdate(userId, { $inc: { creditsLeft: creditsToAdd } }, { new: true })

    return { success: true, clientSecret: paymentIntent.client_secret, user: updatedUser }
}


export const getPriceAmountByPriceId = async (priceId: string) => {
    const price = await stripe.prices.retrieve(priceId)
    return price.unit_amount ?? 0
}