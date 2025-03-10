import { Request, Response } from "express";
import { getFileService, uploadFileService, deleteFileService, deleteMyMediaService } from "src/services/flask-files-services";

export const getFile = async (req: Request, res: Response) => {
    const { subpath } = req.body;
    try {
        const response = await getFileService(subpath);
        if (!response.data || !(response.data.length > 0)) {
            throw new Error('Empty or invalid file response from Flask API');
        }
        const fileBuffer = Buffer.from(response.data);
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        res.set('Content-Type', contentType);
        res.send(fileBuffer);
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const uploadFile = async (req: Request, res: Response) => {
    const file = req.file;
    const { subpath } = req.body;
    if (file) {
        try {
            const response = await uploadFileService(file, subpath);
            if (response.status !== 200) {
                throw new Error('Failed to upload file to Flask API');
            }
            res.status(200).json({ success: true, message: "File uploaded successfully" });
        } catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    } else {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
};

export const deleteFile = async (req: Request, res: Response) => {
    const { subpath } = req.body;
    try {
        const response = await deleteFileService(subpath);
        if (response.status !== 200) {
            throw new Error('Failed to delete file from Flask API');
        }
        res.status(200).json({ success: true, message: "File deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const deleteMyMedia = async (req: Request, res: Response) => {
    const { subpath, projectType } = req.body;
    try {
        const response = await deleteMyMediaService(subpath, projectType);
        if (response.status !== 200) {
            throw new Error('Failed to delete file from Flask API');
        }
        res.status(200).json({ success: true, message: "File deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}