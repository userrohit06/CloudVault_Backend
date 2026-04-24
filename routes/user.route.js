import express from "express";
import {
  getProfile,
  updateUserProfile,
  changePassword,
} from "../controllers/user.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/user-profile", verifyToken, asyncHandler(getProfile));
router.patch(
  "/update-user-profile",
  verifyToken,
  upload.single("profilePicture"),
  asyncHandler(updateUserProfile),
);
router.patch("/update-password", verifyToken, changePassword);

export default router;
