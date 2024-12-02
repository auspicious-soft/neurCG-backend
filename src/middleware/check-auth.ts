import { NextFunction, Request, Response } from "express";
import { httpStatusCode } from "src/lib/constant";
import { JwtPayload } from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { decode } from 'next-auth/jwt'
import { usersModel } from "src/models/user/user-schema";
configDotenv()
declare global {
    namespace Express {
        interface Request {
            user?: string | JwtPayload
        }
    }
}

export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if (!token) return res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized token missing" })
        const decoded = await decode({
            secret: process.env.AUTH_SECRET as string,
            token,
            salt: process.env.JWT_SALT as string
        })
        if (!decoded) return res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized token invalid or expired" })
        const client = await usersModel.findById(decoded.id)
        if (client) {
            client.lastLoggedIn = new Date()
            await client.save()
        }
        next()
    } catch (error) {
        console.log('error: ', error);
        return res.status(httpStatusCode.UNAUTHORIZED).json({ success: false, message: "Unauthorized" })
    }
}