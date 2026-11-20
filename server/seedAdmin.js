
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";
import User from "./models/User.js";

const createAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    
    if (!name || !email || !password) {
      throw new Error(
        "Please provide ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env",
      );
    }

    if (password.length < 8) {
      throw new Error("Admin password must contain at least 8 characters");
    }

    
    await connectDB();

    
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      
      existingUser.role = "admin";
      await existingUser.save();

      console.log("Existing account promoted to admin!");
    } else {
      
      const hashedPassword = await bcrypt.hash(password, 10);

      
      await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
      });

      console.log("Admin account created successfully!");
    }

    console.log("Admin email:", email);
  } catch (error) {
    console.error("Admin seed error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
