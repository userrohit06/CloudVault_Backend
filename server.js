import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// routes
import userRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;

connectDB();

app.use("/api/v1/auth", userRoutes);

app.use(globalErrorHandler);

app.listen(PORT, (error) => {
  console.log("Server is up and running");
});
