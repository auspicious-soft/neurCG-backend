import { z } from "zod";

export const clientSignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).optional(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    referralCode: z.string().optional(),
    profilePic: z.string().optional(),
}).strict({
    message: "Bad payload present in the data"
});

export const clientEditSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dob: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    homeAddress: z.string().optional(),
    profilePic: z.string().min(1),
    phoneNumber: z.string().optional()
}).strict({
    message: "Bad payload present in the data"
}).partial()


export const passswordResetSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string(),
}).refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current password"
})

export const requestTextToVideoSchema = z.object({
    text: z.string().min(1),
    projectAvatar: z.string().min(1),
    textLanguage: z.string().min(1),
    preferredVoice: z.string().min(1),
    subtitles: z.boolean(),
    subtitlesLanguage: z.string().optional(),
}).strict({
    message: "Bad payload present in the data"
})

export const requestAudioToVideoSchema = z.object({
    audio: z.string().min(1),
    audioLength: z.number().min(1),
    projectAvatar: z.string().min(1),
    subtitles: z.boolean(),
    subtitlesLanguage: z.string().optional(),
}).strict({
    message: "Bad payload present in the data"
})

export const requestVideoTranslationSchema = z.object({
    video: z.string().min(1),
    preferredVoice: z.string().min(1),
    projectAvatar: z.string().min(1),
    subtitles: z.boolean(),
    subtitlesLanguage: z.string().optional(),
    videoLength: z.number().min(1),
    originalText: z.string().min(1),
    translatedText: z.string().min(1)
}).strict({
    message: "Bad payload present in the data"
})