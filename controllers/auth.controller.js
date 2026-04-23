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

  // generate token
  const token = jwt.sign(
    {
      userId: existingUser._id,
      email: existingUser.email,
      isActive: existingUser.isActive,
    },
    JWT_SECRET_KEY,
    {
      expiresIn: "10m",
    },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "PRODUCTION",
    sameSite: "strict",
    maxAge: 10 * 60 * 1000,
  });

  res.status(200).json({
    success: false,
    message: "Login successful!",
  });
};

export const logout = async (req, res) => {
  res.clearCookie("token");

  res.status(200).json({
    success: true,
    message: "User logged out successfully!",
  });
};
