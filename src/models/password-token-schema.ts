import mongoose from "mongoose"

const passwordResetSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    expires: {
        type: Date,
        required: true
    }

});

export const passwordResetTokenModel = mongoose.model("passwordResetToken", passwordResetSchema);