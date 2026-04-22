import User from "../models/User.js";
import fs from "fs";

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

    res.status(200).json({
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
