import { z } from "zod";

export const buyPlanSchema = z.object({
    planType: z.enum(['free', 'intro', 'pro']),
    interval: z.enum(['month', 'year'])
}).strict({
    message: "Bad payload present in the data"
})