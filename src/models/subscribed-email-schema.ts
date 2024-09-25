import { Schema, model } from 'mongoose';

const subscribedEmailsSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    isUnsubscribed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

export const subscribedEmailsModel = model('subscribedEmails', subscribedEmailsSchema)
