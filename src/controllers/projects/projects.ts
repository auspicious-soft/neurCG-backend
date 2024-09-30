import { Request, Response } from "express";
import { httpStatusCode } from "src/lib/constant";
import { errorParser } from "src/lib/errors/error-response-handler";
import { getUserProjectsService, convertTextToVideoService } from "src/services/projects/projects";
import { requestTextToVideoSchema } from "src/validation/client-user";
import { formatZodErrors } from "src/validation/format-zod-errors";

export const getUserProjects = async (req: Request, res: Response) => {
    try {
        const response = await getUserProjectsService({ id: req.params.id, ...req.query }, res)
        return res.status(response.total > 0 ? httpStatusCode.OK : httpStatusCode.NO_CONTENT).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const convertTextToVideo = async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined
    const audio = files?.['audio'] ? files['audio'][0].filename : undefined
    const projectAvatar = files?.['projectAvatar'] ? files['projectAvatar'][0].filename : undefined

    const payload = { ...req.body, ...(audio && { audio }), ...(projectAvatar && { projectAvatar }), subtitles: req.body.subtitles === 'true' ? true : false }

    const validation = requestTextToVideoSchema.safeParse(payload)
    if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) });
    try {
        const response = await convertTextToVideoService({ id: req.params.id, payload }, res)
        return res.status(httpStatusCode.OK).json(response)
    }
    catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}