import http from "http";
import morgan from "morgan";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { initSocket } from "./sockets/index.js";
import { attachIO } from "./middlewares/attachIO.js";
import { globalErrorHandler } from "./middl☻ewares/globalErrorHandler.js";

// routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import workspaceRoutes from "./routes/workspace.route.js";

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

const server = http.createServer(app);
const io = initSocket(server);
app.use(attachIO(io));

const PORT = process.env.PORT;

connectDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/workspace", workspaceRoutes);

app.use(globalErrorHandler);

app.listen(PORT, (error) => {
  console.log("Server is up and running");
});
