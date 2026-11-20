import mongoose from "mongoose";
import "dotenv/config";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MOongoDB conected");
  } catch (err) {
    console.error("error", err.message);
    process.exit(1);
  }
}
