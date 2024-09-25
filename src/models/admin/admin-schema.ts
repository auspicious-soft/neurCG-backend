import mongoose from "mongoose"

const adminSchema = new mongoose.Schema({
  role: {
    type: String,
    default: 'admin',
    required: true
  },
  fullName: {
    type: String,
    // required: true
  },
  userName: {
    type: String,
    required: true,
    // unique: true,
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
  phoneNumber: {
    type: String
  },
  bio: {
    type: String
  },
  profilePic: {
    type: String
  },
});

export const adminModel = mongoose.model("admin", adminSchema)