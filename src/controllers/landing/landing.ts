import { Request, Response } from "express";
import { errorParser } from "src/lib/errors/error-response-handler";
import { contactUsService, getLatestUpdatesService } from "../../services/landing/landing-service";
import { httpStatusCode } from "src/lib/constant";

export const contactUs = async (req: Request, res: Response) => {
    try {
        const response = await contactUsService(req.body, res)
        return res.status(httpStatusCode.CREATED).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || 500).json({ success: false, message: message || "An error occurred" });
    }
}

export const getLatestUpdates = async (req: Request, res: Response) => {
    try {
        const response = await getLatestUpdatesService(req.body, res)
        return res.status(httpStatusCode.CREATED).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || 500).json({ success: false, message: message || "An error occurred" });
    }
}