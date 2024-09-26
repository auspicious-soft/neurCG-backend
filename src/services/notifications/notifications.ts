import { Response } from "express";
import { httpStatusCode } from "src/lib/constant";
import { errorResponseHandler } from "src/lib/errors/error-response-handler";
import { notificationsModel } from "src/models/admin/notification-schema";
import { usersModel } from "src/models/user/user-schema";

export const sendNotificationToUserService = async (payload: { title: string, message: string, id: string }, res: Response) => {
    const { title, message, id } = payload
    const user = await usersModel.findById(id)
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res)
    const notification = new notificationsModel({ userId: id, title, message, read: false })
    const response = await notification.save()
    return { success: true, message: "Notification sent successfully", data: response }
}

export const getAllNotificationsOfUserService = async (id: string, res: Response) => {
    const user = await usersModel.findById(id)
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res)
    const results = await notificationsModel.find({ userId: id }).sort({ createdAt: -1 }).select("-__v -userId")
    if (!results.length) return errorResponseHandler("No notifications found", httpStatusCode.NO_CONTENT, res)
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
    return { success: true, message: "Notifications marked as read successfully"}
}   