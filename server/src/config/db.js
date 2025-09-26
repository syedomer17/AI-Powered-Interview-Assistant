import env from "./env.js";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(env.DB_URL);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;