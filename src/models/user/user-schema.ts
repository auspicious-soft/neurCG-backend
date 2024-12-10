import mongoose, { Schema } from "mongoose"

const usersSchema = new mongoose.Schema({
    identifier: {
        type: String,
        // required: true,
        unique: true
    },
    firstName: {
        type: String,
        requried: true
    },
    lastName: {
        type: String,
        requried: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        // required: true,
        select: false,
    },
    dob: {
        type: Date
    },
    phoneNumber: {
        type: String,
    },
    city: { type: String },
    state: { type: String },
    homeAddress: { type: String },
    creditsLeft: { type: Number, default: 24 },
    planType: { type: String, default: "free" },
    stripeCustomerId: { type: String },
    planOrSubscriptionId: { type: String, default: null },
    planInterval: { type: String },
    profilePic: { type: String },
    referredBy: {
        type: Schema.ObjectId,
        ref: "users"
    },
    myReferralCode: {
        type: String,
        unique: true
    },
    referredCount: { type: Number, default: 0 },
    referralBonusPoints: { type: Number, default: 0 },
    referralEarnings: { type: Number, default: 0 },
    lastLoggedIn: { type: Date },
}, { timestamps: true })

export const usersModel = mongoose.model("users", usersSchema)