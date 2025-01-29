import axios from "axios";
import { projectsModel } from "src/models/user/projects-schema";

const flaskUrl = process.env.FLASK_BACKEND_ML_URL as string;

export const getFileService = async (subpath: string) => {
    const formData = new FormData();
    formData.append("subpath", subpath);

    const response = await axios.post(`${flaskUrl}/get-file`, formData, {
        responseType: 'arraybuffer',
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });

    return response;
};

export const uploadFileService = async (file: Express.Multer.File, subpath: string, name?: string) => {
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append("file", blob);
    formData.append("subpath", subpath);
    name && formData.append("name", name);
    const response = await axios.post(`${flaskUrl}/upload-file`, formData, {
        timeout: 600000,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response;
};

export const deleteFileService = async (subpath: string) => {
    const formData = new FormData();
    formData.append("subpath", subpath);

    const response = await axios.post(`${flaskUrl}/delete-file`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })

    return response;
};

export const deleteMyMediaService = async (subpath: string, projectType: 'projectAvatar' | 'audio' | 'video') => {
    const formData = new FormData();
    formData.append("subpath", subpath);
    const response = await axios.post(`${flaskUrl}/delete-file`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    await projectsModel.updateMany({ [projectType]: subpath }, { $set: { [projectType]: "" } })
    return response
}