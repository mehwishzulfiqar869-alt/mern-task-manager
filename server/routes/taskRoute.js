import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import { uploadAttachments } from "../middleware/uploadMiddleware.js";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  downloadAttachment,
} from "../controllers/taskController.js";

const router = express.Router();


router.use(authMiddleware);


router.get("/", getTasks);
router.post("/", uploadAttachments, createTask);
router.patch("/:id", uploadAttachments, updateTask);
router.delete("/:id", deleteTask);

// Secure attachment access (owner or admin checked by controller)
router.get("/:id/attachments/:filename", downloadAttachment);

export default router;