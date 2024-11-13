import mongoose from 'mongoose';

const idempotencyKeySchema = new mongoose.Schema({
    eventId: { type: String, required: true, unique: true },
}, {
    timestamps: true
})

export const IdempotencyKeyModel = mongoose.model('idempotencyKeys', idempotencyKeySchema)