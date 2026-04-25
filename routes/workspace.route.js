import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  acceptInvite,
  createWorkspace,
  inviteMember,
  leaveWorkspace,
} from "../controllers/workspace.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/create", verifyToken, createWorkspace);
router.post("/invite", verifyToken, asyncHandler(inviteMember));
router.post("/accpet", verifyToken, acceptInvite);
router.post("/leave", verifyToken, leaveWorkspace);
