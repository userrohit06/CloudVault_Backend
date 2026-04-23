import User from "../models/User.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  debugger;
  const { fullName, email, password } = req.body;

  const profilePicture = req.file
    ? {
        path: req.file.path,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      }
    : null;

  try {
    if (!fullName || !email || !password) {
      const error = new Error("All fields are required!");
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists!");
      error.statusCode = 409;
      throw error;
    }

    const user = new User({ fullName, email, password, profilePicture });
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (error) {
    // delete file if error occurs
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("File deletion fail while registering", err);
      });
    }

    error.statusCode = error.statusCode || 400;
    throw error;
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("All fields are required!");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    const error = new Error("Invalid credentials!");
    error.statusCode = 400;
    throw error;
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password,
  );
  if (!isPasswordCorrect) {
    const error = new Error("Invalid credentials!");
    error.statusCode = 400;
    throw error;
  }

  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

  const accessToken = jwt.sign(
    {
      userId: existingUser._id,
      email: existingUser.email,
      isActive: existingUser.isActive,
    },
    JWT_SECRET_KEY,
    {
      expiresIn: "10s",
    },
  );

  const refreshToken = jwt.sign(
    {
      userId: existingUser._id,
      email: existingUser.email,
      isActive: existingUser.isActive,
    },
    JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    },
  );

  existingUser.refreshToken = refreshToken;
  await existingUser.save();

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 10 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Login successful!",
  });
};

export const logout = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.refreshToken = null;
  await user.save();

  res.clearCookie("token");
  res.clearCookie("refreshToken");

  res.status(200).json({
    success: true,
    message: "User logged out successfully!",
  });
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    const error = new Error("No refresh token");
    error.statusCode = 401;
    throw error;
  }

  try {
    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

    const decoded = jwt.verify(refreshToken, JWT_SECRET_KEY);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      const error = new Error("Invalid refresh token!");
      error.statusCode = 403;
      throw error;
    }

    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        isActive: user.isActive,
      },
      JWT_SECRET_KEY,
      {
        expiresIn: "10s",
      },
    );

    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 10 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Token refresh successfully!",
    });
  } catch (err) {
    const error = new Error(err.message || "Invalid or expired refresh token");
    error.statusCode = 403;
    throw error;
  }
};
