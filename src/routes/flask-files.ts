import multer from "multer";
import { Router } from "express";
import { configDotenv } from "dotenv";
import { checkAuth } from "src/middleware/check-auth";
import { checkMulter } from "src/lib/errors/error-response-handler";
import { deleteFile, getFile, uploadFile } from "src/controllers/flask-file-controllers";

const router = Router()
configDotenv()

const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 200, // 200 MB
        files: 1,
    }
})

// Get a file from the Flask 
router.post("/", checkAuth, getFile)
// Post a file to the Flask
router.post("/upload", checkAuth, upload.single('file'), checkMulter, uploadFile)
// Delete a file from the Flask
router.delete("/remove", checkAuth, deleteFile)

export { router }