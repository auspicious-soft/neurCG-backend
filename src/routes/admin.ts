import { Router } from "express";
import {
    login,
    //  getAdminInfo, editAdminInfo, 
    // verifySession,
    //  passwordReset, forgotPassword, newPassswordAfterEmailSent, 
    getDashboardStats,
    sendLatestUpdates,
    newPassswordAfterOTPVerified,
    getAllUsers,
    getAUser
    //  updateDashboardStats
} from "../controllers/admin/admin";
// import { checkAdminAuth } from "../middleware/check-auth";
import { upload } from "../configF/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { forgotPassword } from "src/controllers/admin/admin";
import { verifyOtpPasswordReset } from "src/controllers/user/user";



const router = Router();

router.post("/login", login)
router.patch("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOtpPasswordReset)
router.patch("/new-password-otp-verified", newPassswordAfterOTPVerified)


router.post("/send-latest-updates", sendLatestUpdates)
router.get("/users", getAllUsers)
router.get("/users/:id", getAUser)
router.get("/dashboard", getDashboardStats)



// router.get("/verify-session", verifySession);
// router.patch("/update-password", passwordReset)
// router.patch("/forgot-password", forgotPassword)
// router.patch("/new-password-email-sent", newPassswordAfterEmailSent)
// router.put("/edit-info", upload.single("profilePic"), checkMulter, editAdminInfo)
// router.get("/info", getAdminInfo)

// Protected routes
// router.route("/dashboard").get(getDashboardStats).put(updateDashboardStats);
// router.route("/card").post(upload.single("image"), checkMulter, createCard).get(getCards)
// router.route("/card/:id").delete(deleteACard).patch(changeCardStatus)
// router.route("/cards-per-spinner").get(getCardsPerSpinner).patch(updateCardsPerSpinner)


export { router }