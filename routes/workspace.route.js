import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  acceptInvite,
  createWorkspace,
  deleteWorkspace,
  inviteMember,
  leaveWorkspace,
  rejectInvite,
} from "../controllers/workspace.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/create", verifyToken, createWorkspace);
router.post("/invite", verifyToken, asyncHandler(inviteMember));
router.post("/accpet", verifyToken, acceptInvite);
router.post("/reject", verifyToken, asyncHandler(rejectInvite));
router.post("/leave", verifyToken, leaveWorkspace);
router.delete("/remove", verifyToken, deleteWorkspace);
