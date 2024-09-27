import { z } from "zod";

export const clientSignupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    referralCode: z.string().optional(),
}).strict({
    message: "Bad payload present in the data"
});

export const clientEditSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dob: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    homeAddress: z.string().min(1), 
    profilePic: z.string().min(1),
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