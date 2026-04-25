import mongoose from "mongoose";
import Workspace from "../models/Workspace.js";
import WorkspaceMember from "../models/WorkspaceMember.js";
import Invite from "../models/Invite.js";
import User from "../models/User.js";
import { emitWorkspaceEvent, emitUserEvent } from "../sockets/events";

// ----- CREATE WORKSPACE -----
export const createWorkspace = async (req, res, next) => {
  const userId = req.user._id;
  const { workspaceName } = req.body;

  if (!workspaceName.trim()) {
    const error = new Error("Workspace name cannot be empty!");
    error.statusCode = 400;
    throw error;
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const workspace = await Workspace.create(
      [
        {
          name: String(workspaceName || "").trim(),
          owner: userId,
        },
      ],
      { session },
    );

    await WorkspaceMember.create(
      [
        {
          workspace: workspace[0]._id,
          user: req.user._id,
          role: "owner",
        },
      ],
      { session },
    );

    await session.commitTransaction();

    res.status(201).json({
      succcess: true,
      message: "Workspace created successfully!",
      data: workspace[0],
    });
  } catch (e) {
    await session.abortTransaction();
    const error = new Error(e.message || "Something went wrong!");
    error.statusCode = 500;
    next(error);
  } finally {
    session.endSession();
  }
};

// ----- INVITE MEMEBER -----
export const inviteMember = async (req, res) => {
  const { workspaceId, userToId } = req.body;
  const userId = req.user._id;

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace || workspace.isDeleted) {
    const error = new Error("Workspace not found!");
    error.statusCode = 400;
    throw error;
  }

  if (userId === userToId) {
    const error = new Error("Self invite not allowed");
    error.statusCode = 409;
    throw error;
  }

  const userExists = await User.findById(userToId);
  if (!userExists) {
    const error = new Error("User not found!");
    error.statusCode = 404;
    throw error;
  }

  const member = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userId,
  });

  if (!member || !["owner", "admin"].includes(member.role)) {
    const error = new Error("Not allowed to create an invite!");
    error.statusCode = 409;
    throw error;
  }

  const alreadyMember = await WorkspaceMember.findOne({
    workspace: workspaceId,
    user: userToId,
  });

  if (alreadyMember) {
    const error = new Error("Already a member!");
    error.statusCode = 400;
    throw error;
  }

  const invite = await Invite.findOne({
    workspace: workspaceId,
    invitedTo: userToId,
  });

  if (invite && invite.status === "pending") {
    const error = new Error("Invite already sent!");
    error.statusCode = 400;
    throw error;
  }

  if (!invite) {
    invite = await Invite.create({
      workspace: workspaceId,
      invitedBy: userId,
      invitedTo: userToId,
    });
  } else {
    invite.status = "pending";
    await invite.save();
  }

  emitUserEvent(req.io, userToId, "invite:received", { workspaceId });

  res.status(200).json({
    succcess: true,
    message: "Invite sent!",
    data: invite,
  });
};

// ----- ACCEPT INVITE -----
export const acceptInvite = async (req, res) => {
  const { inviteId } = req.body;
  const userId = req.user._id;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const invite = await Invite.findById(inviteId).session(session);

    if (!invite || invite.invitedTo.toString() !== userId) {
      const error = new Error("Invalid invite!");
      error.statusCode = 400;
      throw error;
    }

    const workspace = await Workspace.findById(invite.workspace).sesssion(
      session,
    );
    if (!workspace || workspace.isDeleted) {
      const error = new Error("Workspace deleted!");
      error.statusCode = 404;
      throw error;
    }

    invite.status = "accepted";
    await invite.save({ session });

    await WorkspaceMember.create(
      [
        {
          workspace: invite.workspace,
          user: userId,
        },
      ],
      { session },
    );

    await Workspace.findByIdAndUpdate(
      invite.workspace,
      {
        $inc: { membersCount: 1 },
      },
      { session },
    );

    await session.commitTransaction();

    emitWorkspaceEvent(req.io, invite.workspace, "workspace:member_joined", {
      userId,
    });

    const user = await User.findById(userId);

    res.status(200).json({
      succcess: true,
      message: `${user.fullName} has joined ${workspace.name}`,
    });
  } catch (e) {
    await session.abortTransaction();
    const error = new Error(e.message || "Something went wrong!");
    error.statusCode = 500;
    next(error);
  } finally {
    session.endSession();
  }
};

// ----- LEAVE WORKSPACE -----
export const leaveWorkspace = async (req, res) => {
  const { workspaceId } = req.body;
  const userId = req.user._id;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const member = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: userId,
    }).session(session);

    if (!member) {
      const error = new Error("Not a member!");
      error.statusCode = 400;
      throw error;
    }

    if (member.role === "owner") {
      const error = new Error("Owner cannot leave!");
      error.statusCode = 400;
      throw error;
    }

    await WorkspaceMember.deleteOne({
      workspace: workspaceId,
      user: userId,
    });

    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { $inc: { membersCount: -1 } },
      { session },
    );

    await session.commitTransaction();

    emitWorkspaceEvent(req.io, workspaceId, "workspace:member_left", {
      userId,
    });

    const user = await User.findById(userId);

    res.status(200).json({
      success: true,
      message: `${user.fullName} left ${workspace.name}`,
    });
  } catch (e) {
    await session.abortTransaction();
    const error = new Error(e.message || "Error leaving workpsace");
    error.statusCode = 400;
    throw error;
  } finally {
    session.endSession();
  }
};
