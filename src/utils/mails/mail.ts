import { Resend } from "resend";
import ForgotPasswordEmail from "./templates/forgot-password-reset";
import { configDotenv } from "dotenv";

configDotenv()
const resend = new Resend(process.env.RESEND_API_KEY)


export const sendPasswordResetEmail = async (email: string, token: string) => {
   return await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: email,
        subject: "Reset your password",
        react: ForgotPasswordEmail({ otp: token }),
    })
}

export const sendContactMailToAdmin = async (payload: { name: string, email: string, message: string, phoneNumber: string }) => {
    await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: payload.email,
        subject: "Contact Us | New Message",
        html: `
            <h3>From: ${payload.name}</h3>
            <h3>Email: ${payload.email}</h3>
            <h3>Phone Number: ${payload.phoneNumber}</h3>
            <p>${payload.message}</p>
        `
    })
}

export const sendLatestUpdatesEmail = async (email: string, title: string, message: string) => {
    return await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: email,
        subject: title,
        html: `
            <h3>${title}</h3>
            <p>${message}</p>
        `
    });
};