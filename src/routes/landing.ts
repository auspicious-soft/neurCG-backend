import { Router } from "express";
import { contactUs, getLatestUpdates } from "../controllers/landing/landing";
const router = Router();

router.post("/contact-us", contactUs)
router.post("/latest-updates", getLatestUpdates)
export { router }