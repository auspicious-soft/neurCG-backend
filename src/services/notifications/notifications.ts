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