import { NextFunction, Request, Response } from "express";
import { httpStatusCode } from "src/lib/constant";
import jwt, { JwtPayload } from "jsonwebtoken";
import { configDotenv } from "dotenv";

configDotenv()
declare global {
    namespace Express {
        interface Request {
            user?: string | JwtPayload
        }
    }
}

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        console.log('token: ', token);
        if (!token) return res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized" })
        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            if (err) {
                console.log('Token verification error: ', err)
                return res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized" });
            }

            req.user = decoded
            next()
        });
        next()
    } catch (error) {
        console.log('error: ', error);
        return res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized" })
    }
}