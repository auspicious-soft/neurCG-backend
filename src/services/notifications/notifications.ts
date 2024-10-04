import { Response } from "express";
import { httpStatusCode } from "src/lib/constant";
import { errorResponseHandler } from "src/lib/errors/error-response-handler";
import { notificationsModel } from "src/models/admin/notification-schema";
import { usersModel } from "src/models/user/user-schema";

export const sendNotificationToUsersService = async (payload: { title: string, message: string }, res: Response) => {
    const users = await usersModel.find()
    if (!users.length) return errorResponseHandler("No users found", httpStatusCode.NO_CONTENT, res)
    const notifications = users.map(user => ({ userId: user._id, title: payload.title, message: payload.message }))
    await notificationsModel.insertMany(notifications)
    return { success: true, message: "Notification sent successfully to all the users" }
}

export const sendNotificationToUserService = async (payload: { title: string, message: string, ids: string[] }, res: Response) => {
    const { title, message, ids } = payload
    const users = await usersModel.find({ _id: { $in: ids } })
    if (!users.length) return errorResponseHandler("No users found", httpStatusCode.NO_CONTENT, res)
    const notifications = users.map(user => ({ userId: user._id, title, message }))
    await notificationsModel.insertMany(notifications)
    return { success: true, message: "Notification sent successfully" };
};

export const getAllNotificationsOfUserService = async (id: string, res: Response) => {
    const user = await usersModel.findById(id)
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res)
    const results = await notificationsModel.find({ userId: id }).sort({ createdAt: -1 }).select("-__v -userId")
    return { success: true, message: "Notifications fetched successfully", data: results }
}

export const markAllNotificationsAsReadService = async (id: string, res: Response) => {
    const user = await usersModel.findById(id)
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res)
    const notifications = await notificationsModel.find({ userId: id, read: false }).select("-__v -userId")
    if (!notifications.length) return errorResponseHandler("No notifications found", httpStatusCode.NO_CONTENT, res)
    for (const notification of notifications) {
        await notificationsModel.findByIdAndUpdate(notification._id, { read: true })
    }
    return { success: true, message: "Notifications marked as read successfully" }
}   