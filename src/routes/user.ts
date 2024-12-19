import { Router } from "express";
import express from "express";
import { login, signup, forgotPassword, verifyOtpPasswordReset, newPassswordAfterOTPVerified, passwordReset, getUserInfo, editUserInfo, getUserInfoByEmail, verifyEmail } from "../controllers/user/user";
import { getAllNotificationsOfUser, markAllNotificationsAsRead } from "src/controllers/notifications/notifications";
import { getUserProjects, convertTextToVideo, convertAudioToVideo, translateVideo, deleteProject, stopProjectCreation } from "src/controllers/projects/projects";
import { buyPlan, cancelSubscription, updateUserCreditsAfterSuccessPayment } from "src/controllers/plans/plans";
import { checkAuth } from "src/middleware/check-auth";
import { getAvatar } from "src/controllers/admin/avatar";

const router = Router();


router.post("/signup", signup)
router.patch("/verify-email/:id", verifyEmail)
router.post("/login", login)
router.patch("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOtpPasswordReset)
router.patch("/new-password-otp-verified", newPassswordAfterOTPVerified)
router.patch("/update-password/:id", passwordReset)
router.get('/avatars', checkAuth, getAvatar)


router.route("/:id").get(checkAuth, getUserInfo).put(checkAuth, editUserInfo)
router.route("/:id/notifications").get(checkAuth, getAllNotificationsOfUser).put(checkAuth, markAllNotificationsAsRead)
router.get("/email/:email", getUserInfoByEmail)

router.get("/:id/projects", checkAuth, getUserProjects)
router.post("/:id/text-to-video", checkAuth, convertTextToVideo)
router.post("/:id/audio-to-video", checkAuth, convertAudioToVideo)
router.post("/:id/video-translation", checkAuth, translateVideo)
router.delete("/projects/:id", checkAuth, deleteProject)
router.patch("/:id/stop-project-creation", checkAuth, stopProjectCreation)

//Payments
router.post('/:id/buy-plan', checkAuth, buyPlan);
router.post('/webhook', express.raw({ type: 'application/json' }), updateUserCreditsAfterSuccessPayment)
router.patch('/:id/cancel-subscription', checkAuth, cancelSubscription)

export { router }