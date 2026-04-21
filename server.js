import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

connectDB();

app.listen(PORT, (error) => {
  console.log("Server is up and running");
});
