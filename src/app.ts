import express from "express"
import cors from "cors"
// import cookieParser from "cookie-parser";
import path from "path"
import { fileURLToPath } from 'url'
import connectDB from "./configF/db"
import { admin, user, landing, getFlaskFile } from "./routes"
import { checkValidAdminRole } from "./utils"
import bodyParser from 'body-parser'

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url) // <-- Define __filename
const __dirname = path.dirname(__filename)        // <-- Define __dirname

const PORT = process.env.PORT || 8000
const app = express()
app.set("trust proxy", true)
app.use(bodyParser.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    }
  }));
// app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "*",
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
        credentials: true,
    })
);


var dir = path.join(__dirname, 'static')
app.use(express.static(dir))

var uploadsDir = path.join(__dirname, 'uploads')
app.use('/uploads', express.static(uploadsDir))


connectDB();


app.get("/", (_, res: any) => {
    res.send("Hello world entry point 🚀✅");
});

app.use("/api/admin", checkValidAdminRole, admin);
app.use("/api/user", user);
app.use("/api/landing", landing)
app.use("/api/file", getFlaskFile)

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
