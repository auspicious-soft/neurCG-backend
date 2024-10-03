import { Request, Response } from "express";
import { httpStatusCode } from "src/lib/constant";
import { errorParser } from "src/lib/errors/error-response-handler";
import { buyPlanService } from "src/services/plans/plans";
import { formatZodErrors } from "src/validation/format-zod-errors";
import { buyPlanSchema } from "src/validation/payment";

export const buyPlan = async (req: Request, res: Response) => {
    const validation = buyPlanSchema.safeParse(req.body)
    if (!validation.success) return res.status(httpStatusCode.BAD_REQUEST).json({ success: false, message: formatZodErrors(validation.error) })
    try {
        const response = await buyPlanService({ id: req.params.id, ...req.body }, res)
        return res.status(httpStatusCode.CREATED).json(response)
    } catch (error) {
        const { code, message } = errorParser(error)
        return res.status(code || httpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: message || "An error occurred" })
    }

}