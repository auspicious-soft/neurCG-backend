import { Response } from "express";
import { httpStatusCode } from "src/lib/constant";
import { errorResponseHandler } from "src/lib/errors/error-response-handler";
import { avatarModel } from "src/models/admin/avatar-schema";

export const postAvatarService = async (payload: any, res: Response) => {
    const { avatarPic } = payload
    if (!avatarPic) return errorResponseHandler("Avatar is required", httpStatusCode.BAD_REQUEST, res)
    const newPayload = { ...payload, avatarUrl: avatarPic }
    const addAvatar = new avatarModel(newPayload)
    await addAvatar.save()
    return { success: true, message: "Avatar added successfully" }
}

export const getAvatarService = async (res: Response) => {
    const avatars = await avatarModel.find()
    return { success: true, message: "Avatars fetched successfully", data: avatars }
}

export const deleteAvatarService = async (id: string, res: Response) => {
    const avatar = await avatarModel.findById(id)
    if (!avatar) return errorResponseHandler("Avatar not found", httpStatusCode.NOT_FOUND, res)
    await avatarModel.findByIdAndDelete(id)
    return { success: true, message: "Avatar deleted successfully" }
}