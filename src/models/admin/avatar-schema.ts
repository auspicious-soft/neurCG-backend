import { Schema, model } from "mongoose";

const avatarSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    required: true,
  }
}, { timestamps: true })

export const avatarModel = model("avatars", avatarSchema)