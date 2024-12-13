import axios from "axios";
import { configDotenv } from "dotenv";
import { Request, Response, Router } from "express";
import multer from "multer";
import { deleteFile, getFile, uploadFile } from "src/controllers/flask-file-controllers";
import { checkMulter } from "src/lib/errors/error-response-handler";
import { checkAuth } from "src/middleware/check-auth";
const router = Router()
configDotenv()

const flaskUrl = process.env.FLASK_BACKEND_ML_URL as string;
// Get a file from the Flask 
router.post("/", checkAuth, getFile)


const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 200, // 200 MB
        files: 1,
    }
})

// Post a file to the Flask
router.post("/upload", checkAuth, upload.single('file'), checkMulter, uploadFile)


// Delete a file from the Flask
router.delete("/remove", checkAuth, deleteFile)

export { router }