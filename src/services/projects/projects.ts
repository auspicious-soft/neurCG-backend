import axios from "axios"
import { Response } from "express"
import path from "path"
import fs from 'fs';
import { fileURLToPath } from 'url'
import { deleteFile } from "src/configF/multer"
import { httpStatusCode } from "src/lib/constant"
import { errorResponseHandler } from "src/lib/errors/error-response-handler"
import { projectsModel } from "src/models/user/projects-schema"
import { usersModel } from "src/models/user/user-schema"
import FormData from 'form-data'
// Set up __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
    const dataToSend = rest.payload
    const user = await usersModel.findById(id)
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res)
    const formData = new FormData();
    formData.append('data', JSON.stringify(dataToSend))

    const flaskUrl = process.env.FLASK_BACKEND_ML_URL as string
    // const response = await axios.post(flaskUrl)
    const srcDir = path.join(__dirname, '..', '..')
    if (dataToSend.audio) {
        const audioPath = path.join(srcDir, dataToSend.audio);
        const audioContent = fs.readFileSync(audioPath);
        formData.append('audio', audioContent, dataToSend.audio);
    }
    const projectAvatarPath = path.join(srcDir, dataToSend.projectAvatar);
    const projectAvatarContent = fs.readFileSync(projectAvatarPath);
    formData.append('projectAvatar', projectAvatarContent, { filename: path.basename(projectAvatarPath) })
    try {
        const response = await axios.get(flaskUrl,
            //  formData, {
            // headers: formData.getHeaders()

        // }
    );
        console.log('response: ', response.data);
        if (dataToSend.audio) {
            const audioPath = path.join(srcDir, dataToSend.audio);
            deleteFile(audioPath);
        }
        if (dataToSend.projectAvatar) {
            const projectAvatarPath = path.join(srcDir, dataToSend.projectAvatar);
            deleteFile(projectAvatarPath);
        }
        return {
            success: true,
            message: "Text converted to video successfully"
        }
    } catch (error) {
        console.error('Error during API call:', error);
        return errorResponseHandler("An error occurred during the API call", httpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
}