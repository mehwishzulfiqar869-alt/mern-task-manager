import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import taskRoutes from "./routes/taskRoute.js";
import adminRoute from "./routes/adminRoute.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());




app.get("/test", (req, res) => {
  res.status(200).send("Express is working!");
});


app.use("/api/auth", authRoute);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoute);

app.use(async (error, req, res, _next) => {
  const { removeUploadedFiles } = await import("./utils/attachments.js");
  await removeUploadedFiles(req.files);
  if (error instanceof Error && error.name === "MulterError") {
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "Each attachment must be 5 MB or smaller."
      : error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE"
        ? "A task can have at most 5 attachments."
        : error.message;
    return res.status(400).json({ message });
  }
  if (error) return res.status(400).json({ message: error.message || "Upload failed" });
});

const serverStart = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Express application started successfully");
  });
};

serverStart();
