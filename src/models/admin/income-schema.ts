import mongoose, { Schema } from "mongoose";

const incomeSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    planType: {
        type: String,
        enum: ['free', 'intro', 'pro'],
        required: true
    },
    planOrSubscriptionId: {
        type: String,
    },
    stripeCustomerId: {
        type: String,
    },
    planAmount: {
        type: Number,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    monthYear: {
        type: String, // Format could be "YYYY-MM" for easier aggregation
        required: true
    }
}, { timestamps: true });

export const IncomeModel = mongoose.model("incomes", incomeSchema);