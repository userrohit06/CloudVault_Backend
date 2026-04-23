import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyToken = async (req, res, next) => {
  let token;

  // get token from cookies
  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // error if no token found
  if (!token) {
    const error = new Error("Unauthorized: No token provided!");
    error.statusCode = 401;
    return next(error);
  }

  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

  try {
    // verify token
    const decoded = jwt.verify(token, JWT_SECRET_KEY);

    // get user from db
    const user = await User.findById(decoded?.userId).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    req.user = user;
    next();
  } catch (err) {
    const error = new Error(err.message || "Invalid or expired token!");
    error.statusCode = 401;
    next(error);
  }
};
