import { Router } from "express";
import { upload } from "../configF/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { login, signup,  forgotPassword, verifyOtpPasswordReset, newPassswordAfterOTPVerified, passwordReset, getUserInfo, editUserInfo } from "../controllers/user/user";
import { getAllNotificationsOfUser, markAllNotificationsAsRead } from "src/controllers/notifications/notifications";
const router = Router();

router.post("/signup", signup)
router.post("/login", login)
router.patch("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOtpPasswordReset)
router.patch("/new-password-otp-verified", newPassswordAfterOTPVerified)
router.patch("/update-password/:id", passwordReset)


router.route("/:id").get(getUserInfo).put(upload.single("profilePic"), checkMulter, editUserInfo)
router.route("/:id/notifications").get(getAllNotificationsOfUser).put(markAllNotificationsAsRead)

export { router }