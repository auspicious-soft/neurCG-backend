//write schema here for projects collection with fields like name, user_id, created_at, updated_at, avatarId optional
import { Schema, model } from "mongoose";

const projectsSchema = new Schema({
    projectName: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "users" },
    projectVideoLink: { type: String, required: true },
    projectAvatar: { type: Schema.Types.Mixed, required: true },
    subtitles: { type: Boolean, required: true },
    text: { type: String, required: false },
    textLanguage: { type: String, required: false },
    preferredVoice: { type: String, required: false },
    subtitlesLanguage: { type: String, required: false },

}, { timestamps: true })

export const projectsModel = model("projects", projectsSchema)