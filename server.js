import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import morgan from "morgan";

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(express.json());

const PORT = process.env.PORT;

connectDB();

app.use(globalErrorHandler);

app.listen(PORT, (error) => {
  console.log("Server is up and running");
});
