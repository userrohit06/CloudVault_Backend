import express from "express";
import { upload } from "../middlewares/multer.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signin, signup } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", upload.single("profilePicture"), asyncHandler(signup));
router.post("/signin", asyncHandler(signin));

export default router;
