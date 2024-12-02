import { Request, Response } from "express";
import mongoose from "mongoose";
import { httpStatusCode } from "src/lib/constant";
import { errorParser } from "src/lib/errors/error-response-handler";
import { getUserProjectsService, convertTextToVideoService, convertaAudioToVideoService, translateVideoService, deleteProjectService } from "src/services/projects/projects";
import { requestAudioToVideoSchema, requestTextToVideoSchema, requestVideoTranslationSchema } from "src/validation/client-user";
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


export const deleteProject = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();
        const payload = { id: req.params.id, ...req.body };
        const response = await deleteProjectService(payload, res, session);
        return res.status(httpStatusCode.OK).json(response);
    } catch (error) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const convertTextToVideo = async (req: Request, res: Response) => {
    const validation = requestTextToVideoSchema.safeParse(req.body)
    if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) });

    // const session = await mongoose.startSession();
    try {
        // await session.startTransaction();
        const payload = { id: req.params.id, ...req.body };
        const response = await convertTextToVideoService(payload, res, 
            // session
        );
        return res.status(httpStatusCode.OK).json(response);
    } catch (error) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    } finally {
        // await session.endSession();
    }
}


export const convertAudioToVideo = async (req: Request, res: Response) => {
    const validation = requestAudioToVideoSchema.safeParse(req.body)
    if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) });

    const session = await mongoose.startSession();
    try {
        await session.startTransaction();
        const payload = { id: req.params.id, ...req.body };
        const response = await convertaAudioToVideoService(payload, res, session);
        return res.status(httpStatusCode.OK).json(response);
    } catch (error) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}

export const translateVideo = async (req: Request, res: Response) => {
    const validation = requestVideoTranslationSchema.safeParse(req.body)
    if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) });

    const session = await mongoose.startSession();
    try {
        await session.startTransaction();
        const payload = { id: req.params.id, ...req.body };
        const response = await translateVideoService(payload, res, session);
        return res.status(httpStatusCode.OK).json(response);
    } catch (error) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}