import { Request, Response } from "express";
import { httpStatusCode } from "src/lib/constant";
import { errorParser } from "src/lib/errors/error-response-handler";
import { sendNotificationToUserService } from "src/services/notifications/notifications";
import { sendNotificationToUserSchema } from "src/validation/admin-user";
import { formatZodErrors } from "src/validation/format-zod-errors";
import { z } from "zod";

export const sendNotificationToUser = async (req: Request, res: Response) => {
    const validation = sendNotificationToUserSchema.safeParse(req.body)
    if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) })
    try {
        const response = await sendNotificationToUserService({ id: req.params.id, ...req.body }, res)
        return res.status(httpStatusCode.CREATED).json(response)
    } catch (error: any) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }
}