import express from "express";
import { upload } from "../middlewares/multer.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  forgotPasswordToken,
  logout,
  protectedRoute,
  refreshToken,
  resetPasswordToken,
  sendOtp,
  signin,
  signup,
  veriifyOTP,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// public routes
router.post("/signup", upload.single("profilePicture"), asyncHandler(signup));
router.post("/signin", asyncHandler(signin));
router.post("/refresh-token", asyncHandler(refreshToken));
router.post("/forgot-password-token", asyncHandler(forgotPasswordToken));
router.post("/reset-password-token/:token", asyncHandler(resetPasswordToken));
router.post("/send-otp", asyncHandler(sendOtp));
router.post("/verify-otp", asyncHandler(veriifyOTP));

// protected routes
router.post("/logout", verifyToken, asyncHandler(logout));

export default router;
