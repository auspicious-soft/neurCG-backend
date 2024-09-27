import { Request, Response } from "express";
import { httpStatusCode } from "src/lib/constant";
import { errorParser } from "src/lib/errors/error-response-handler";
import { getUserProjectsService } from "src/services/projects/projects";

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