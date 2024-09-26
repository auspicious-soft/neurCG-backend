import { Schema, model } from 'mongoose';

const notificationsSchema = new Schema({
    userId: {
        type: Schema.ObjectId,
        ref: "users"
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    },
},
    { timestamps: true }
)

export const notificationsModel = model('notifications', notificationsSchema)