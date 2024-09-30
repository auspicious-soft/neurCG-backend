import { Request, Response } from "express";
import { httpStatusCode } from "src/lib/constant";
import { errorParser } from "src/lib/errors/error-response-handler";
import { deleteAvatarService, getAvatarService, postAvatarService } from "../../services/admin/avatar"

export const postAvatar = async (req: Request, res: Response) => {
    const avatarPic = req.file
    console.log('req.files: ', req.files);
    console.log('avatarPic: ', avatarPic);
    const rest = req.body
    const payload = { ...rest, avatarPic }
    try {
        const response = await postAvatarService(payload, res)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (err: any) {
        const { code, message } = errorParser(err)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });

    }
}

export const getAvatar = async (req: Request, res: Response) => {
    try {
        const response = await getAvatarService(res)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (err: any) {
        const { code, message } = errorParser(err)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });

    }
}

export const deleteAvatar = async (req: Request, res: Response) => {
    try {
        const response = await deleteAvatarService(req.params.id, res)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (err: any) {
        const { code, message } = errorParser(err)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" });

    }
}