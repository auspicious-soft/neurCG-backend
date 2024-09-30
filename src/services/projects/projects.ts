import { Response } from "express"
import { httpStatusCode } from "src/lib/constant"
import { errorResponseHandler } from "src/lib/errors/error-response-handler"
import { projectsModel } from "src/models/user/projects-schema"
import { usersModel } from "src/models/user/user-schema"

export const getUserProjectsService = async (payload: any, res: Response) => {
    const { id } = payload
    const user = await usersModel.findById(id)
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res)
    // const { page = '1', limit = '10' } = payload
    // const pageInt = parseInt(page)
    // const limitInt = parseInt(limit)
    // const offset = (pageInt - 1) * limitInt
    const totalDataCount = await projectsModel.countDocuments()
    const results = await projectsModel.find().select("-__v")

    const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7))  // alternate is import { subDays } from 'date-fns'; const sevenDaysAgo = subDays(new Date(), 7);
    // this week results
    const recentProjects = await projectsModel.find({ createdAt: { $gte: sevenDaysAgo } }).select("-__v")
    // old  results
    const oldProjects = await projectsModel.find({ createdAt: { $lt: sevenDaysAgo } }).select("-__v")

    if (results.length) return {
        // pageInt,
        // limitInt,
        success: true,
        total: totalDataCount,
        data: {
            recentProjects,
            oldProjects
        }
    }
    else {
        return {
            data: {},
            // pageInt,
            // limitInt,
            success: true,
            total: 0
        }
    }
}

export const convertTextToVideoService = async (payload: any, res: Response) => {
    const { id, ...rest } = payload
    const user = await usersModel.findById(id)
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res)
    
    return {
        success: true,
        message: "Text converted to video successfully"
    }
}