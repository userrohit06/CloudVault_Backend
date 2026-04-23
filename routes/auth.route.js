import express from "express";
import { upload } from "../middlewares/multer.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  logout,
  protectedRoute,
  refreshToken,
  signin,
  signup,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// public routes
router.post("/signup", upload.single("profilePicture"), asyncHandler(signup));
router.post("/signin", asyncHandler(signin));
router.post("/refresh-token", asyncHandler(refreshToken));

// protected routes
router.post("/logout", verifyToken, asyncHandler(logout));

export default router;
