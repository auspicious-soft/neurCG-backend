import { Response } from "express";
import { uploadFile } from "src/controllers/flask-file-controllers";
import { httpStatusCode } from "src/lib/constant";
import { errorResponseHandler } from "src/lib/errors/error-response-handler";
import { avatarModel } from "src/models/admin/avatar-schema";
import { uploadFileService } from "../flask-files-services";

export const postAvatarService = async (payload: any, res: Response) => {
    const { avatarUrl, file, name } = payload

    if (!avatarUrl) return errorResponseHandler("Avatar is required", httpStatusCode.BAD_REQUEST, res)
    if (!Object.keys(file).length) return errorResponseHandler("File is required", httpStatusCode.BAD_REQUEST, res)
    if (!name) return errorResponseHandler("Name is required", httpStatusCode.BAD_REQUEST, res)
    
    const response = await uploadFileService(file, avatarUrl, name)
    if (response.status !== 200) return errorResponseHandler("Failed to upload file to Flask API", httpStatusCode.INTERNAL_SERVER_ERROR, res)
    const addAvatar = new avatarModel({
        name,
        avatarUrl
    })
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