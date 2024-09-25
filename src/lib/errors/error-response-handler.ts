import multer from "multer";
import { Response } from "express";
import { httpStatusCode } from "../constant";

export const errorResponseHandler = (message: string, code: number = 500, res: Response) => {
    console.log('message:', message);
    throw new Error(JSON.stringify({
        success: false,
        message,
        code
    }))
}

export const errorParser = (error: any) => {
    try {
        return JSON.parse(error.message);
    } catch (e) {
        return {
            code: httpStatusCode.INTERNAL_SERVER_ERROR,
            message: "An unexpected error occurred in parser"
        };
    }
}

export const checkMulter = (err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
        res.status(400).json({ success: false, message: `${err.message}` });
    } else {
        next();
    }
};