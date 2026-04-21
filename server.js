import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT;

connectDB();

app.use(globalErrorHandler);

app.listen(PORT, (error) => {
  console.log("Server is up and running");
});
