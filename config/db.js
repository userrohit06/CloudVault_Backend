import mongoose from "mongoose";
import logger from "../utils/logger.js";

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  try {
    const connection = await mongoose.connect(MONGO_URI);
    logger.info(`DB Connected: ${connection.connection.host}`);
  } catch (error) {
    logger.error(`DB Error: ${error.message}`);

    setTimeout(() => {
      process.exit(1);
    }, 500);
  }
};
