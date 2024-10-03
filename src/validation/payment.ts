import { z } from "zod";

export const buyPlanSchema = z.object({
    planType: z.enum(['free', 'intro', 'pro'])
}).strict({
    message: "Bad payload present in the data"
})