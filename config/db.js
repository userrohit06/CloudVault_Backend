import mongoose from "mongoose";

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  try {
    const connection = await mongoose.connect(MONGO_URI);
    console.log(`Database connected: ${connection.connection.host}`);
  } catch (error) {
    console.log(`Database connection error: ${error.message}`);
    process.exit(-1);
  }
};
