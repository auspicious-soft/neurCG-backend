import * as z from 'zod'

export const adminUserLoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
}).strict({
    message: "Bad payload present in the data"
})


export const addWellnessSchema = z.object({
    title: z.string(),
    assignTo: z.enum(["client", "therapist"]),
    link: z.string(),
    attachment: z.string(),
    description: z.string(),
}).strict({
    message: "Bad payload present in the data"
})

export const addUserSchema = z.object({
    fullName: z.string(),
    email: z.string().email(),
    password: z.string(),
    role: z.enum([
        "Support Team Agent",
        "Support Team Supervisor",
        "Office Admin",
        "Clinical Director",
        "QP / Supervisor",
        "Director of Operation/ Billing",
        "Director",
        "Clinician",
        "Peer Support Specialist",
        "Para Professional",
        "AP"
    ]),
})