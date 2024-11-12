import { adminModel } from "../../models/admin/admin-schema";
import bcrypt from "bcryptjs";
import { Response } from "express";
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
    const limit = parseInt(payload.limit as string) || 0
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
    const userProjects = await projectsModel.find({ userId: id }).select("-__v");
    if (userProjects.length === 0) {
        return {
            success: true,
            message: "User retrieved successfully",
            data: {
                user,
                projects: [],
                avatarsUsed: []
            }
        };
    }

    const usedAvatars = userProjects.map((project: any) => project.projectAvatar);
    const uniqueAvatars = [...new Set(usedAvatars)];
    const avatarIds = uniqueAvatars.filter(avatar => mongoose.Types.ObjectId.isValid(avatar));
    const userUploadedPaths = uniqueAvatars.filter(avatar => !mongoose.Types.ObjectId.isValid(avatar));

    const avatarsInfo = avatarIds.length > 0 ? await avatarModel.find({ _id: { $in: avatarIds } }).select("-__v avatarUrl") : [];
    const combinedAvatarsInfo = [...avatarsInfo, ...userUploadedPaths];

    return {
        success: true,
        message: "User retrieved successfully",
        data: {
            user,
            projects: userProjects,
            avatarsUsed: combinedAvatarsInfo
        }
    };
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
    //Income data
    const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        return date.toISOString().slice(0, 7) // Format "YYYY-MM"
    }).reverse()

    const incomeData = await IncomeModel.aggregate([
        {
            $match: {
                monthYear: { $in: last12Months }
            }
        },
        {
            $group: {
                _id: "$monthYear",
                totalIncome: { $sum: "$planAmount" }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ])

    const incomeMap = new Map(last12Months.map(month => [month, 0]))
    incomeData.forEach(item => {
        incomeMap.set(item._id, item.totalIncome)
    })

    const formattedIncomeData = Array.from(incomeMap, ([month, totalIncome]) => ({
        month,
        totalIncome
    }))

    const incomeThisMonth = formattedIncomeData[formattedIncomeData.length - 1]?.totalIncome || 0;

    //Users growth data
    const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7))
    const totalUsers = await usersModel.countDocuments()
    const proUsers = await usersModel.countDocuments({ planType: "pro" })
    const normalUsers = await usersModel.countDocuments({ planType: "free" })
    const newUsersData = await usersModel.find({ createdAt: { $gte: sevenDaysAgo } }).select("-__v")
    const userData = await usersModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1, new Date().getMonth(), 1)),
              $lte: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            userCount: { $sum: 1 }
          }
        },
        {
          $sort: { _id: -1 }
        }
      ]);   
    const userMap = new Map(last12Months.map(month => [month, 0]));
    userData.forEach(item => {
        userMap.set(item._id, item.userCount);
    })
    const formattedUserData = Array.from(userMap, ([month, userCount]) => ({
        month,
        userCount
    }))
    const response = {
        success: true,
        message: "Dashboard stats fetched successfully",
        data: {
            incomeThisMonth,
            incomeData: {
                months: formattedIncomeData.map(item => item.month),
                income: formattedIncomeData.map(item => item.totalIncome)
            },  
            usersGrowth: {
                months: formattedUserData.map(item => item.month),
                count: formattedUserData.map(item => item.userCount)
            },
            totalUsers,
            proUsers,
            normalUsers,
            newUsers: newUsersData.length,
            newUsersData
        }
    }

    return response
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

