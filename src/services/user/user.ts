import { Request, Response } from "express"
import { customAlphabet } from "nanoid";
import { errorResponseHandler } from "../../lib/errors/error-response-handler"
import { usersModel } from "../../models/user/user-schema"
import bcrypt from "bcryptjs"
import { generatePasswordResetToken, getPasswordResetTokenByToken } from "../../utils/mails/token"
import { sendPasswordResetEmail, sendSignUpEmail } from "../../utils/mails/mail"
import { httpStatusCode } from "../../lib/constant"
import mongoose from "mongoose"
import { passwordResetTokenModel } from "../../models/password-token-schema"
import { increaseReferredCountAndCredits } from "src/utils"
import { sendNotificationToUserService } from "../notifications/notifications"


export const signupService = async (payload: any, res: Response) => {
    const client = await usersModel.findOne({ email: payload.email })
    if (client) return errorResponseHandler("Email already exists", httpStatusCode.BAD_REQUEST, res)
    if (payload.password) {
        const newPassword = bcrypt.hashSync(payload.password, 10)
        payload.password = newPassword
    }
    const genId = customAlphabet('1234567890', 8)
    const identifier = customAlphabet('0123456789', 3)
    payload.myReferralCode = `${process.env.NEXT_PUBLIC_APP_URL}/signup?referralCode=${genId()}`
    payload.identifier = identifier()
    if (payload.referralCode) {
        const referredBy = await usersModel.findOne({ myReferralCode: `${process.env.NEXT_PUBLIC_APP_URL}/signup?referralCode=${payload.referralCode}` })
        if (referredBy) {
            payload.referredBy = referredBy._id           //Set my referred by
            await increaseReferredCountAndCredits(referredBy._id)   //Increase referred count of the person who referred me
            await sendNotificationToUserService({ title: "Referral", message: "Congrats! A new user has signed up with your referral code", ids: [referredBy._id.toString()] }, res)   //Sending THE NOTIFICATION TO THE USER WHO REFERRED ME
        }
    }
    const newUser = new usersModel({ ...payload, email: payload.email.toLowerCase().trim() })
    await newUser.save()
    const emailVerificationToken = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 32)
    const token = emailVerificationToken()
    await sendSignUpEmail(newUser, token)
    return { success: true, message: "Client signup successfull", data: newUser }
}

export const verifyEmailService = async (id: string, res: Response) => {
    const user = await usersModel.findById(id)
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res)
    return await usersModel.findByIdAndUpdate(id, { isVerified: true }, { new: true })
}

export const loginService = async (payload: any, res: Response) => {
    const { email, password } = payload
    const client = await usersModel.findOne({ email }).select('+password')
    if (!client) return errorResponseHandler("Email not found", httpStatusCode.NOT_FOUND, res)
    if (!client.isVerified) return errorResponseHandler("Email not verified", httpStatusCode.UNAUTHORIZED, res)
    const isPasswordValid = bcrypt.compareSync(password, client.password as string)
    if (!isPasswordValid) return errorResponseHandler("Invalid password", httpStatusCode.UNAUTHORIZED, res)
    const clientObject: any = client.toObject()
    delete clientObject.password
    return { success: true, message: "Login successful", data: clientObject }
}

export const forgotPasswordService = async (email: string, res: Response) => {
    const client = await usersModel.findOne({ email })
    if (!client) return errorResponseHandler("Email not found", httpStatusCode.NOT_FOUND, res)
    const passwordResetToken = await generatePasswordResetToken(email)
    if (passwordResetToken !== null) {
        await sendPasswordResetEmail(email, passwordResetToken.token)
        return { success: true, message: "Password reset email sent with otp" }
    }
}

export const verifyOtpPasswordResetService = async (token: string, res: Response) => {
    const existingToken = await getPasswordResetTokenByToken(token)
    if (!existingToken) return errorResponseHandler("Invalid token", httpStatusCode.BAD_REQUEST, res)

    const hasExpired = new Date(existingToken.expires) < new Date()
    if (hasExpired) return errorResponseHandler("OTP expired", httpStatusCode.BAD_REQUEST, res)
    return { success: true, message: "Token verified successfully" }
}


export const newPassswordAfterOTPVerifiedService = async (payload: { password: string, otp: string }, res: Response, session: mongoose.mongo.ClientSession) => {
    const { password, otp } = payload
    const existingToken = await getPasswordResetTokenByToken(otp)
    if (!existingToken) return errorResponseHandler("Invalid OTP", httpStatusCode.BAD_REQUEST, res)

    const hasExpired = new Date(existingToken.expires) < new Date()
    if (hasExpired) return errorResponseHandler("OTP expired", httpStatusCode.BAD_REQUEST, res)

    const existingClient = await usersModel.findOne({ email: existingToken.email }).session(session)
    if (!existingClient) return errorResponseHandler("Client email not found", httpStatusCode.NOT_FOUND, res)

    const hashedPassword = await bcrypt.hash(password, 10)
    const response = await usersModel.findByIdAndUpdate(existingClient._id, { password: hashedPassword }, { session, new: true })
    await passwordResetTokenModel.findByIdAndDelete(existingToken._id).session(session)
    await session.commitTransaction();
    session.endSession();

    return {
        success: true,
        message: "Password updated successfully",
        data: response
    }
}

export const passwordResetService = async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body
    const getAdmin = await usersModel.findById(req.params.id).select("+password")
    if (!getAdmin) return errorResponseHandler("Admin not found", httpStatusCode.NOT_FOUND, res)

    const passwordMatch = bcrypt.compareSync(currentPassword, getAdmin.password as string)
    if (!passwordMatch) return errorResponseHandler("Current password invalid", httpStatusCode.BAD_REQUEST, res)
    const hashedPassword = bcrypt.hashSync(newPassword, 10)
    const response = await usersModel.findByIdAndUpdate(req.params.id, { password: hashedPassword })
    return {
        success: true,
        message: "Password updated successfully",
        data: response
    }
}

export const getUserInfoService = async (id: string, res: Response) => {
    const client = await usersModel.findById(id)
    if (!client) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res)
    return {
        success: true,
        message: "Client info fetched successfully",
        data: client
    }
}

export const getUserInfoByEmailService = async (email: string, res: Response) => {
    const client = await usersModel.findOne({ email })
    if (!client) return {
        success: false,
        message: "User not found",
    }
    return {
        success: true,
        message: "Client info fetched successfully",
        data: client
    }
}

export const editUserInfoService = async (payload: any, res: Response) => {
    const { id } = payload
    const client = await usersModel.findById(id)
    if (!client) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res)

    const updatedClient = await usersModel.findByIdAndUpdate(id, payload, { new: true })
    return {
        success: true,
        message: "Client info updated successfully",
        data: updatedClient
    }
}
