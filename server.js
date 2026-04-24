import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT;

connectDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

app.use(globalErrorHandler);

app.listen(PORT, (error) => {
  console.log("Server is up and running");
});
