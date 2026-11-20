import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import taskRoutes from "./routes/taskRoute.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/test", (req, res) => {
  res.status(200).send("Express is working!");
});

// Authentication routes
app.use("/api/auth", authRoute);
app.use("/api/tasks", taskRoutes);

const serverStart = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Express application started successfully");
  });
};

serverStart();
