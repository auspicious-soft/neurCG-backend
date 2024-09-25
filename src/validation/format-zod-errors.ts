import { z } from "zod";

export const formatZodErrors = (errors: z.ZodError<any>): any => {
  return errors.errors.map((error) => ({
    name: error.path.join("."),
    message: error.message,
  }));
};