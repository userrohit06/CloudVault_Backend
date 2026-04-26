import express from "express";
import { PERMISSIONS } from "../config/permissions.js";
import { authorize } from "../middlewares/authorize.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  acceptInvite,
  createWorkspace,
  deleteWorkspace,
  inviteMember,
  leaveWorkspace,
  rejectInvite,
} from "../controllers/workspace.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createWorkspace);

router.post(
  "/invite",
  verifyToken,
  authorize(PERMISSIONS.INVITE_MEMBER),
  asyncHandler(inviteMember),
);

router.post("/accept", verifyToken, acceptInvite);
router.post("/reject", verifyToken, asyncHandler(rejectInvite));

router.post(
  "/leave",
  verifyToken,
  authorize(PERMISSIONS.LEAVE_WORKSPACE),
  leaveWorkspace,
);

router.delete(
  "/remove",
  verifyToken,
  authorize(PERMISSIONS.DELETE_WORKSPACE),
  deleteWorkspace,
);
