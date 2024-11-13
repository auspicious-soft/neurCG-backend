import mongoose from 'mongoose';

const idempotencyKeySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    sessionId: { type: String },
    eventId: { type: String },
    processed: { type: Boolean, default: false },
    createdAt: { type: Date, required: true },
    processedAt: { type: Date },
    expiresAt: { 
        type: Date, 
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    }
});

// Index to automatically remove expired keys
idempotencyKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const IdempotencyKeyModel = mongoose.model('IdempotencyKey', idempotencyKeySchema)