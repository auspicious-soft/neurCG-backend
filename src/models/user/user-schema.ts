import mongoose, { Schema } from "mongoose"

const usersSchema = new mongoose.Schema({
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
        required: true,
        select: false,
    },
    dob: {
        type: Date
    },
    city: { type: String },
    state: { type: String },
    homeAddress: { type: String },
    creditsLeft: { type: Number, default: 0 },
    profilePic: { type: String },
    myReferralCode: {
        type: String,
        unique: true
    },
    referredBy: {
        type: Schema.ObjectId,
        ref: "users"
    }

});

export const usersModel = mongoose.model("users", usersSchema)