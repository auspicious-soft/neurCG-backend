import axios from "axios"
import { configDotenv } from "dotenv"
import { Request, Response } from "express"
import mongoose, { SortOrder } from "mongoose"
import { httpStatusCode } from "src/lib/constant"
import { errorResponseHandler } from "src/lib/errors/error-response-handler"
import { usersModel } from "src/models/user/user-schema"
import { uploadFileService } from "src/services/flask-files-services"
configDotenv()

const { AWS_REGION, AWS_BUCKET_NAME } = process.env;

export const checkValidAdminRole = (req: Request, res: Response, next: any) => {
    const { role } = req.headers
    if (role !== 'admin') return res.status(403).json({ success: false, message: "Invalid role" })
    else return next()
}

interface Payload {
    description?: string;
    order?: string;
    orderColumn?: string;
}

export const queryBuilder = (payload: Payload, querySearchKeyInBackend = ['name']) => {
    let { description = '', order = '', orderColumn = '' } = payload;
    const query = description ? { $or: querySearchKeyInBackend.map(key => ({ [key]: { $regex: description, $options: 'i' } })) } : {}
    const sort: { [key: string]: SortOrder } = order && orderColumn ? { [orderColumn]: order === 'asc' ? 1 : -1 } : {};

    return { query, sort };
}

export const convertToBoolean = (value: string) => {
    if (value === 'true') return true
    else if (value === 'false') return false
    else return value
}

export const increaseReferredCountAndCredits = async (id: mongoose.Types.ObjectId) => {
    await usersModel.findByIdAndUpdate(id, { $inc: { referredCount: 1, creditsLeft: 10 } })
}

export const flaskTextToVideo = async (payload: any, res: Response) => {
    try {
        const flaskUrl = process.env.FLASK_BACKEND_ML_URL as string
        const formData = new FormData()
        formData.append('image_url', `${payload.projectAvatar}`)
        formData.append('text', payload.text)
        formData.append('text_language', payload.textLanguage)
        formData.append('preferred_voice', payload.preferredVoice)
        formData.append('subtitles', payload.subtitles)
        formData.append('subtitles_language', payload.subtitlesLanguage)
        formData.append('duration', payload.duration)
        const response = await axios.post(`${flaskUrl}/text-to-video`, formData, {
            timeout: 600000,
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        if (!response.data || !(response.data.length > 0)) {
            throw new Error('Empty or invalid video response from Flask API');
        }
        // Use the response data directly as a buffer
        const videoFileName = `video_${Date.now()}.mp4`
        const videoBuffer = Buffer.from(response.data)
        const filePath = `projects/${payload.email}/my-projects/${videoFileName}`;
        await uploadFileService(videoBuffer as unknown as Express.Multer.File, filePath)       
        return filePath
    } catch (error) {
        return errorResponseHandler("An error occurred during the API call in flaskTextToVideo", httpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
}

export const flaskAudioToVideo = async (payload: any, res: Response) => {
    try {
        const flaskUrl = process.env.FLASK_BACKEND_ML_URL as string
        const formData = new FormData()
        formData.append('image_url', `${payload.projectAvatar}`)
        formData.append('audio_url', `${payload.audio}`)
        formData.append('subtitles', payload.subtitles)
        formData.append('subtitles_language', payload.subtitlesLanguage)
        formData.append('duration', payload.duration)

        const response = await axios.post(`${flaskUrl}/audio-to-video`, formData, {
            timeout: 600000, responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        if (!response.data || !(response.data.length > 0)) {
            throw new Error('Empty or invalid video response from Flask API');
        }
        // Use the response data directly as a buffer
        const videoFileName = `video_${Date.now()}.mp4`
        const videoBuffer = Buffer.from(response.data)
        const filePath = `projects/${payload.email}/my-projects/${videoFileName}`;
        await uploadFileService(videoBuffer as unknown as Express.Multer.File, filePath)
        return filePath
      
    } catch (error) {
        return errorResponseHandler("An error occurred during the API call in flaskAudioToVideo", httpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
}

export const flaskTranslateVideo = async (payload: any, res: Response) => {
    try {
        const flaskUrl = process.env.FLASK_BACKEND_ML_URL as string
        const formData = new FormData()
        formData.append('video_url', `${payload.video}`)
        formData.append('original_text', payload.originalText)
        formData.append('translated_text', payload.translatedText)
        formData.append('image_url', `${payload.projectAvatar}`)
        formData.append('preferred_voice', `${payload.preferredVoice}`)
        formData.append('subtitles', payload.subtitles)
        formData.append('subtitles_language', payload.subtitlesLanguage)
        formData.append('duration', payload.duration)

        const response = await axios.post(`${flaskUrl}/video-translation`, formData, {
            timeout: 600000, responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        if (!response.data || !(response.data.length > 0)) {
            throw new Error('Empty or invalid video response from Flask API');
        }
        // Use the response data directly as a buffer
        const videoFileName = `video_${Date.now()}.mp4`
        const videoBuffer = Buffer.from(response.data)
        const filePath = `projects/${payload.email}/my-projects/${videoFileName}`;

        await uploadFileService(videoBuffer as unknown as Express.Multer.File, filePath)
        return filePath
    }
    catch (error) {
        return errorResponseHandler("An error occurred during the API call in flaskTranslateVideo", httpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
}