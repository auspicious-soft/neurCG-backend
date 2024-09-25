import { Router } from "express";
import { upload } from "../configF/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { login, signup,  forgotPassword, verifyOtpPasswordReset, newPassswordAfterOTPVerified, passwordReset, getClientInfo, editClientInfo } from "../controllers/user/user";
const router = Router();

router.post("/signup", signup)
router.post("/login", login)
router.patch("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOtpPasswordReset)
router.patch("/new-password-otp-verified", newPassswordAfterOTPVerified)
router.patch("/update-password/:id", passwordReset)


router.route("/:id").get(getClientInfo).put(upload.single("profilePic"), checkMulter, editClientInfo)

export { router }