import { Router } from "express";
import { upload } from "../configF/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { login, signup, forgotPassword, verifyOtpPasswordReset, newPassswordAfterOTPVerified, passwordReset, getUserInfo, editUserInfo } from "../controllers/user/user";
import { getAllNotificationsOfUser, markAllNotificationsAsRead } from "src/controllers/notifications/notifications";
import { getUserProjects, convertTextToVideo } from "src/controllers/projects/projects";
import { buyPlan, updateUserCreditsAfterSuccessPayment } from "src/controllers/plans/plans";

const router = Router();

router.post("/signup", signup)
router.post("/login", login)
router.patch("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOtpPasswordReset)
router.patch("/new-password-otp-verified", newPassswordAfterOTPVerified)
router.patch("/update-password/:id", passwordReset)


router.route("/:id").get(getUserInfo).put(upload.single("profilePic"), checkMulter, editUserInfo)

router.route("/:id/notifications").get(getAllNotificationsOfUser).put(markAllNotificationsAsRead)

router.get("/:id/projects", getUserProjects)
router.post("/:id/text-to-video", upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'projectAvatar', maxCount: 1 }]), checkMulter, convertTextToVideo)


//Payments
router.post('/:id/buy-plan', buyPlan);
router.post('/webhook', updateUserCreditsAfterSuccessPayment)

export { router }