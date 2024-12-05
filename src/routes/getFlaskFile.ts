import axios from "axios";
import { configDotenv } from "dotenv";
import { Request, Response, Router } from "express";
const router = Router();
configDotenv()

router.post("/", async (req: Request, res: Response) => {
    const { subpath } = req.body
    const flaskUrl = process.env.FLASK_BACKEND_ML_URL as string
    try {
        const formData = new FormData()
        formData.append("subpath", subpath)

        const response = await axios.post(`${flaskUrl}/get-file`, formData, {
            timeout: 600000,
            responseType: 'arraybuffer',
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        if (!response.data || !(response.data.length > 0)) {
            throw new Error('Empty or invalid file response from Flask API');
        }
        const fileBuffer = Buffer.from(response.data)
        res.set('Content-Type', 'application/octet-stream')
        res.send(fileBuffer)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Internal Server Error" })
    }
})

export { router }