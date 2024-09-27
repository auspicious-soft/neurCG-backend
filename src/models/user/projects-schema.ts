//write schema here for projects collection with fields like name, user_id, created_at, updated_at, avatarId optional
import { Schema, model } from "mongoose";

const projectsSchema = new Schema({

    projectName: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "users" },
    text: { type: String, required: false },
    textLanguage: { type: String, required: false },
    preferredVoice: { type: String, required: false },
    audio: { type: String, required: false },
    subtitles: { type: Boolean, required: true },
    subtitlesLanguage: { type: String, required: false },
    projectAvatar: { type: Schema.Types.Mixed, required: true },
    projectVideoLink: { type: String, required: true }

}, { timestamps: true })

export const projectsModel = model("projects", projectsSchema)