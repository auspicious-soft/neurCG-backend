import axios from "axios";
import { configDotenv } from "dotenv";
import { Request, Response, Router } from "express";
import multer from "multer";
import { checkMulter } from "src/lib/errors/error-response-handler";
import { checkAuth } from "src/middleware/check-auth";

const router = Router()
configDotenv()

const flaskUrl = process.env.FLASK_BACKEND_ML_URL as string;
// Get a file from the Flask 
router.post("/", checkAuth, async (req: Request, res: Response) => {
    const { subpath } = req.body;
    try {
        const formData = new FormData();
        formData.append("subpath", subpath);

        const response = await axios.post(`${flaskUrl}/get-file`, formData, {
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        if (!response.data || !(response.data.length > 0)) {
            throw new Error('Empty or invalid file response from Flask API');
        }
        const fileBuffer = Buffer.from(response.data);

        // Determine the content type based on the file extension
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        res.set('Content-Type', contentType)
        res.send(fileBuffer)
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
})


const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 200, // 200 MB
        files: 1,
    }
})

// Post a file to the Flask
router.post("/upload", checkAuth, upload.single('file'), checkMulter, async (req: Request, res: Response) => {
    const file = req.file
    const formData = new FormData()
    if (file) {
        const blob = new Blob([file.buffer], { type: file.mimetype })
        formData.append("file", blob, file.originalname)

        try {

            const response = await axios.post(`${flaskUrl}/upload-file`, formData, {
                timeout: 600000,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            if (response.status !== 200) {
                throw new Error('Failed to upload file to Flask API');
            }
            res.status(200).json({ success: true, message: "File uploaded successfully" });
        }

        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
    else {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
})


// Delete a file from the Flask
router.post("/remove", checkAuth, async (req: Request, res: Response) => {
    const { subpath } = req.body
    try {
        const formData = new FormData()
        formData.append("subpath", subpath)
        const response = await axios.post(`${flaskUrl}/delete-file`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        if (response.status !== 200) {
            throw new Error('Failed to delete file from Flask API');
        }
        res.status(200).json({ success: true, message: "File deleted successfully" });
    }

    catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
})

export { router }