import { Router } from "express";
import express from "express";
import { upload } from "../configF/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { login, signup, forgotPassword, verifyOtpPasswordReset, newPassswordAfterOTPVerified, passwordReset, getUserInfo, editUserInfo } from "../controllers/user/user";
import { getAllNotificationsOfUser, markAllNotificationsAsRead } from "src/controllers/notifications/notifications";
import { getUserProjects, convertTextToVideo, convertAudioToVideo } from "src/controllers/projects/projects";
import { buyPlan, cancelSubscription, updateUserCreditsAfterSuccessPayment } from "src/controllers/plans/plans";
import { checkAuth } from "src/middleware/check-auth";
import { getAvatar } from "src/controllers/admin/avatar";

const router = Router();


router.post("/signup", signup)
router.post("/login", login)
router.patch("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOtpPasswordReset)
router.patch("/new-password-otp-verified", newPassswordAfterOTPVerified)
router.patch("/update-password/:id", passwordReset)
router.get('/avatars', checkAuth, getAvatar)


router.route("/:id").get(checkAuth, getUserInfo).put(checkAuth, editUserInfo)
router.route("/:id/notifications").get(checkAuth, getAllNotificationsOfUser).put(checkAuth, markAllNotificationsAsRead)

router.get("/:id/projects", checkAuth, getUserProjects)
router.post("/:id/text-to-video", checkAuth, convertTextToVideo)
router.post("/:id/audio-to-video", checkAuth, convertAudioToVideo)

//Payments
router.post('/:id/buy-plan', checkAuth, buyPlan);
router.post('/webhook', express.raw({ type: 'application/json' }), updateUserCreditsAfterSuccessPayment)
router.patch('/:id/cancel-subscription', checkAuth, cancelSubscription)

export { router }