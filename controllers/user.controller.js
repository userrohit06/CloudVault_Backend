import User from "../models/User.js";
import fs from "fs";
import bcrypt from "bcryptjs";

export const getProfile = async (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    data: {
      fullname: user.fullName || "",
      email: user.email || "",
      profilePicture:
        {
          ...user.profilePicture,
          path: user.profilePicture.path.replace(/\\/g, "/") || "",
        } || "",
    },
  });
};

export const updateUserProfile = async (req, res) => {
  const userId = req.user._id;

  const { fullName, email } = req.body || {};

  const updatedData = {};

  if (fullName) updatedData.fullName = fullName;

  if (email) {
    const user = await User.findOne({ email });

    if (user && user._id.toString() !== userId.toString()) {
      const error = new Error("Email already in use!");
      error.statusCode = 400;
      throw error;
    }

    updatedData.email = email;
  }

  if (req.file) {
    const currentUser = await User.findById(userId);

    if (currentUser?.profilePicture?.path) {
      const oldPath = currentUser.profilePicture.path;

      // delete old file if exists
      fs.unlink(oldPath, (err) => {
        if (err) {
          console.error("Failed to delete old image:", err.message);
        }
      });
    }

    updatedData.profilePicture = {
      path: req.file.path,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    };
  }

  if (req.body && "password" in req.body) {
    const error = new Error("Password cannot be updated here");
    error.statusCode = 400;
    throw error;
  }

  if (Object.keys(updatedData).length === 0) {
    const error = new Error("No data provided to update!");
    error.statusCode = 400;
    throw error;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: updatedData,
    },
    { new: true, runValidators: true },
  ).select("-password");

  res.status(200).json({
    success: true,
    message: "User profile updated successfully!",
  });
};

export const changePassword = async (req, res) => {
  const userId = req.user._id;

  if (Object.keys(req.body || {}).length === 0) {
    const error = new Error("Invalid request!");
    error.statusCode = 400;
    throw error;
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    const error = new Error("Both current and new passwords are required!");
    error.statusCode = 400;
    throw error;
  }

  if (currentPassword === newPassword) {
    const error = new Error(
      "Current password and new password cannot be same!",
    );
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);

  const isCurrentPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password,
  );
  if (!isCurrentPasswordCorrect) {
    const error = new Error("Current password is incorrect!");
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: false,
    message: "Password updated successfully!",
  });
};
