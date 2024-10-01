import { Response } from "express";
import { httpStatusCode } from "src/lib/constant";
import { errorResponseHandler } from "src/lib/errors/error-response-handler";
import { subscribedEmailsModel } from "src/models/subscribed-email-schema";
import { sendContactMailToAdmin } from "src/utils/mails/mail";

export const contactUsService = async (payload: any, res: Response) => {
    const { name, email, message, phoneNumber } = payload
    if (!name || !email || !message || !phoneNumber) return errorResponseHandler("All fields are required", httpStatusCode.BAD_REQUEST, res)
    await sendContactMailToAdmin(payload)
    return { success: true, message: "We have recieved your message successfully" }
}

export const getLatestUpdatesService = async (payload: { email: string }, res: Response) => {
    const { email } = payload
    if (!email) return errorResponseHandler("Email is required", httpStatusCode.BAD_REQUEST, res)
    const alreadySubscribed = await subscribedEmailsModel.findOne({ email })
    if (alreadySubscribed) return {
        success: false,
        message: "You are already subscribed to our latest updates"
    }
    const addEmail = new subscribedEmailsModel({ email })
    await addEmail.save()
    return { success: true, message: "You are subscribed to our latest updates" }
}