//write schema here for projects collection with fields like name, user_id, created_at, updated_at, avatarId optional
import { Schema, model } from "mongoose";

const projectsSchema = new Schema({
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "users" },
    projectAvatar: { type: Schema.Types.Mixed, required: true },
    projectVideoLink: { type: String, required: true },
}, { timestamps: true })

export const projectsModel = model("projects", projectsSchema)