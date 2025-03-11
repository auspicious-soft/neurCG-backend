import { Resend } from "resend";
import ForgotPasswordEmail from "./templates/forgot-password-reset";
import { configDotenv } from "dotenv";
import SignUpEmail from "./templates/signup-email-template";

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
    return await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
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
}

export const sendSignUpEmail = async (user: any, token: string) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL as string
    const emailVerificationUrl = `${appUrl}/verify-email/?token=${token}&userId=${user._id}`
    return await resend.emails.send({
        from: process.env.COMPANY_RESEND_GMAIL_ACCOUNT as string,
        to: user.email,
        subject: "Welcome to Maity",
        react: SignUpEmail({ emailVerificationUrl })
    });
}