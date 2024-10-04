import { adminModel } from "../../models/admin/admin-schema";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { queryBuilder } from "../../utils";
import { subscribedEmailsModel } from "src/models/subscribed-email-schema";
import { sendLatestUpdatesEmail, sendPasswordResetEmail } from "src/utils/mails/mail";
import { generatePasswordResetToken, getPasswordResetTokenByToken } from "src/utils/mails/token";
import mongoose from "mongoose";
import { passwordResetTokenModel } from "src/models/password-token-schema";
import { usersModel } from "src/models/user/user-schema";
import { IncomeModel } from "src/models/admin/income-schema";
import { projectsModel } from "src/models/user/projects-schema";
import { avatarModel } from "src/models/admin/avatar-schema";
// import { clientModel } from "../../models/user/user-schema";
// import { passswordResetSchema, testMongoIdSchema } from "../../validation/admin-user";
// import { generatePasswordResetToken, getPasswordResetTokenByToken } from "../../lib/send-mail/tokens";
// import { sendPasswordResetEmail } from "../../lib/send-mail/mail";
// import { passwordResetTokenModel } from "../../models/password-forgot-schema";



interface loginInterface {
    email: string;
    password: string;
}

//Auth Services
export const loginService = async (payload: loginInterface, res: Response) => {
    const getAdmin = await adminModel.findOne({ email: payload.email.toLowerCase() }).select("+password")
    if (!getAdmin) return errorResponseHandler("Admin not found", httpStatusCode.NOT_FOUND, res)
    const passwordMatch = bcrypt.compareSync(payload.password, getAdmin.password)
    if (!passwordMatch) return errorResponseHandler("Invalid password", httpStatusCode.BAD_REQUEST, res)
    const tokenPayload = {
        id: getAdmin._id,
        email: getAdmin.email,
        // role: getAdmin.role
    }
    // const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, { expiresIn: "30d" })
    // res.cookie("token", token, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "none",
    //     domain: "24-x7-fx-admin-frontend.vercel.app",
    //     maxAge: 30  24  60  60  1000
    // })
    return { success: true, message: "Admin Login successfull", data: tokenPayload }
}

export const forgotPasswordService = async (email: string, res: Response) => {
    const admin = await adminModel.findOne({ email })
    if (!admin) return errorResponseHandler("Email not found", httpStatusCode.NOT_FOUND, res)
    const passwordResetToken = await generatePasswordResetToken(email)
    if (passwordResetToken !== null) {
        await sendPasswordResetEmail(email, passwordResetToken.token)
        return { success: true, message: "Password reset email sent with otp" }
    }
}

export const newPassswordAfterOTPVerifiedService = async (payload: { password: string, otp: string }, res: Response, session: mongoose.mongo.ClientSession) => {
    const { password, otp } = payload
    const existingToken = await getPasswordResetTokenByToken(otp)
    if (!existingToken) return errorResponseHandler("Invalid OTP", httpStatusCode.BAD_REQUEST, res)

    const hasExpired = new Date(existingToken.expires) < new Date()
    if (hasExpired) return errorResponseHandler("OTP expired", httpStatusCode.BAD_REQUEST, res)

    const existingAdmin = await adminModel.findOne({ email: existingToken.email }).session(session)
    if (!existingAdmin) return errorResponseHandler("Admin email not found", httpStatusCode.NOT_FOUND, res)

    const hashedPassword = await bcrypt.hash(password, 10)
    const response = await adminModel.findByIdAndUpdate(existingAdmin._id, { password: hashedPassword }, { session, new: true })
    await passwordResetTokenModel.findByIdAndDelete(existingToken._id).session(session)
    await session.commitTransaction();
    session.endSession();

    return {
        success: true,
        message: "Password updated successfully",
        data: response
    }
}

export const getAllUsersService = async (payload: any) => {
    const page = parseInt(payload.page as string) || 1
    const limit = parseInt(payload.limit as string) || 10
    const offset = (page - 1) * limit
    const { query, sort } = queryBuilder(payload, ['firstName', 'lastName'])
    const totalDataCount = Object.keys(query).length < 1 ? await usersModel.countDocuments() : await usersModel.countDocuments(query)
    const results = await usersModel.find(query).sort(sort).skip(offset).limit(limit).select("-__v")
    if (results.length) return {
        page,
        limit,
        success: true,
        total: totalDataCount,
        data: results
    }
    else {
        return {
            data: [],
            page,
            limit,
            success: false,
            total: 0
        }
    }
}

export const getAUserService = async (id: string, res: Response) => {
    const user = await usersModel.findById(id)
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res)
    const userProjects = await projectsModel.find({ userId: id }).select("-__v")
    const usedAvatars = userProjects.map((project: any) => project.projectAvatar)
    const uniqueAvatars = [...new Set(usedAvatars)]
    const avatarIds = uniqueAvatars.filter(avatar => mongoose.Types.ObjectId.isValid(avatar))
    const userUploadedPaths = uniqueAvatars.filter(avatar => !mongoose.Types.ObjectId.isValid(avatar))

    const avatarsInfo = await avatarModel.find({ _id: { $in: avatarIds } }).select("-__v avatarUrl")
    const combinedAvatarsInfo = [...avatarsInfo, ...userUploadedPaths]
    return {
        success: true,
        message: "User retrieved successfully",
        data: {
            user,
            projects: userProjects,
            avatarsUsed: combinedAvatarsInfo
        }
    }
}

export const sendLatestUpdatesService = async (payload: any, res: Response) => {
    const { message, title } = payload;

    if (!message || !title) return errorResponseHandler("All fields are required", httpStatusCode.BAD_REQUEST, res);

    const bulkEmailsAddresses = await subscribedEmailsModel.find({ isUnsubscribed: false }).select("email -_id");
    if (bulkEmailsAddresses.length === 0) return errorResponseHandler("No subscribed emails found", httpStatusCode.NOT_FOUND, res);

    for (const { email } of bulkEmailsAddresses) {
        await sendLatestUpdatesEmail(email, title, message).catch((err) => {
            return errorResponseHandler("Failed to send email", httpStatusCode.INTERNAL_SERVER_ERROR, res);
        })
    }
    return {
        success: true,
        message: "Latest updates sent successfully"
    }
}
// Dashboard
export const getDashboardStatsService = async (payload: any, res: Response) => {

    return { success: true, message: "Dashboard stats fetched successfully" }

}

// Client Services
export const getIncomeDataService = async (payload: any) => {
    const page = parseInt(payload.page as string) || 1
    const limit = parseInt(payload.limit as string) || 10
    const offset = (page - 1) * limit
    const { query, sort } = queryBuilder(payload, ['userName'])
    const totalDataCount = Object.keys(query).length < 1 ? await IncomeModel.countDocuments() : await IncomeModel.countDocuments(query)
    const results = await IncomeModel.find(query).sort(sort).skip(offset).limit(limit).select("-__v")
    if (results.length) return {
        page,
        limit,
        success: true,
        total: totalDataCount,
        data: results
    }
    else {
        return {
            data: [],
            page,
            limit,
            success: true,
            total: 0
        }
    }
}

