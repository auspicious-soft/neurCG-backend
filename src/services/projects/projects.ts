import { Response } from "express"
import path from "path"
import fs from 'fs';
import { fileURLToPath } from 'url'
import { deleteFile } from "src/configF/multer"
import { httpStatusCode } from "src/lib/constant"
import { errorResponseHandler } from "src/lib/errors/error-response-handler"
import { projectsModel } from "src/models/user/projects-schema"
import { usersModel } from "src/models/user/user-schema"
import { flaskTextToVideo, flaskAudioToVideo, flaskTranslateVideo } from "src/utils";
import mongoose from "mongoose";
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
    const recentProjects = await projectsModel.find({ userId: id, createdAt: { $gte: sevenDaysAgo } }).select("-__v")
    // old  results
    const oldProjects = await projectsModel.find({ userId: id, createdAt: { $lt: sevenDaysAgo } }).select("-__v")

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

export const deleteProjectService = async (payload: any, res: Response, session: mongoose.ClientSession) => {
    const { id } = payload;
    const project = await projectsModel.findById(id).session(session);
    if (!project) return errorResponseHandler("Project not found", httpStatusCode.NOT_FOUND, res);
    const response = await projectsModel.findByIdAndDelete(id)
    return {
        success: true,
        message: "Project deleted successfully",
        data: response
    }
}

export const convertTextToVideoService = async (payload: any, res: Response,
    // session: mongoose.ClientSession

) => {
    const { id, ...rest } = payload;

    const user = await usersModel.findById(id)
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);

    const WORDS_PER_MINUTE = 150;
    const SECONDS_PER_CREDIT = 10;
    const words = rest.text.trim().split(/\s+/).length;
    const videoLengthSeconds = Math.ceil(words / WORDS_PER_MINUTE * 60);
    const creditsExhausted = Math.ceil(videoLengthSeconds / SECONDS_PER_CREDIT);

    if (user.creditsLeft < creditsExhausted) return errorResponseHandler(`Insufficient credits. Required: ${creditsExhausted}, Available: ${user.creditsLeft}`, httpStatusCode.BAD_REQUEST, res);
    const convertedVideo = await flaskTextToVideo({ duration: videoLengthSeconds, email: user.email, ...rest }, res);

    if (convertedVideo) {
        // Add to projects collections
        const newProject = new projectsModel({
            projectVideoLink: convertedVideo,
            userId: id,
            projectName: rest.text.trim().slice(0, 10),
            projectAvatar: rest.projectAvatar,
            text: rest.text,
            textLanguage: rest.textLanguage,
            preferredVoice: rest.preferredVoice,
            subtitles: rest.subtitles,
            subtitlesLanguage: rest.subtitlesLanguage,
            duration: videoLengthSeconds
        })
        await newProject.save(
            // { session }
        );

        // Update user credits
        const updatedUser = await usersModel.findByIdAndUpdate(id, { $inc: { creditsLeft: -creditsExhausted } }, {
            new: true,
            // session
        });

        if (!updatedUser) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);

        // Commit transaction here
        // await session.commitTransaction()
        return {
            success: true,
            message: "Text converted to video successfully",
            data: {
                creditsUsed: creditsExhausted,
                creditsRemaining: updatedUser.creditsLeft,
                estimatedLength: videoLengthSeconds,
                videoUrl: convertedVideo
            }
        }
    }
    else {
        // await session.abortTransaction(); // Rollback if video conversion fails
        return errorResponseHandler("An error occurred during the API call", httpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
}

export const convertaAudioToVideoService = async (payload: any, res: Response, session: mongoose.ClientSession) => {
    const { id, ...rest } = payload;

    const user = await usersModel.findById(id).session(session);
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);

    const duration = rest.audioLength
    const SECONDS_PER_CREDIT = 10;
    const creditsExhausted = Math.floor(duration / SECONDS_PER_CREDIT)
    if (user.creditsLeft < creditsExhausted) return errorResponseHandler(`Insufficient credits. Required: ${creditsExhausted}, Available: ${user.creditsLeft}`, httpStatusCode.BAD_REQUEST, res)
    const convertedVideo = await flaskAudioToVideo({ duration, email: user.email, ...rest }, res);
    if (convertedVideo) {
        // Add to projects collections
        const newProject = new projectsModel({
            userId: id,
            projectVideoLink: convertedVideo,
            audio: rest.audio,
            projectName: Math.random().toString(36).substring(7),
            projectAvatar: rest.projectAvatar,
            subtitles: rest.subtitles,
            subtitlesLanguage: rest.subtitlesLanguage,
            duration
        })
        await newProject.save({ session });

        // Update user credits
        const updatedUser = await usersModel.findByIdAndUpdate(id, { $inc: { creditsLeft: -creditsExhausted } }, { new: true, session });

        if (!updatedUser) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);

        // Commit transaction here
        await session.commitTransaction()
        return {
            success: true,
            message: "Audio converted to video successfully",
            data: {
                creditsUsed: creditsExhausted,
                creditsRemaining: updatedUser.creditsLeft,
                estimatedLength: duration,
                videoUrl: convertedVideo
            }
        }
    }
    else {
        await session.abortTransaction(); // Rollback if video conversion fails
        return errorResponseHandler("An error occurred during the API call", httpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
}

export const translateVideoService = async (payload: any, res: Response, session: mongoose.ClientSession) => {
    const { id, ...rest } = payload;

    const user = await usersModel.findById(id).session(session);
    if (!user) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);

    const SECONDS_PER_CREDIT = 10;
    const creditsExhausted = Math.floor(rest.videoLength / SECONDS_PER_CREDIT)
    if (user.creditsLeft < creditsExhausted) return errorResponseHandler(`Insufficient credits. Required: ${creditsExhausted}, Available: ${user.creditsLeft}`, httpStatusCode.BAD_REQUEST, res)
    const convertedVideo = await flaskTranslateVideo({ duration: rest.videoLength, email: user.email, ...rest }, res);
    if (convertedVideo) {
        // Add to projects collections
        const newProject = new projectsModel({
            userId: id,
            projectVideoLink: convertedVideo,
            video: rest.video,
            originalText: rest.originalText,
            translatedText: rest.translatedText,
            projectName: Math.random().toString(36).substring(7),
            projectAvatar: rest.projectAvatar,
            subtitles: rest.subtitles,
            subtitlesLanguage: rest.subtitlesLanguage,
            duration: rest.videoLength
        })
        await newProject.save({ session });

        // Update user credits
        const updatedUser = await usersModel.findByIdAndUpdate(id, { $inc: { creditsLeft: -creditsExhausted } }, { new: true, session });

        if (!updatedUser) return errorResponseHandler("User not found", httpStatusCode.NOT_FOUND, res);

        // Commit transaction here
        await session.commitTransaction()
        return {
            success: true,
            message: "Video translated to video successfully",
            data: {
                creditsUsed: creditsExhausted,
                creditsRemaining: updatedUser.creditsLeft,
                estimatedLength: rest.videoLength,
                videoUrl: convertedVideo
            }
        }
    }
    else {
        await session.abortTransaction(); // Rollback if video conversion fails
        return errorResponseHandler("An error occurred during the API call", httpStatusCode.INTERNAL_SERVER_ERROR, res);
    }
}