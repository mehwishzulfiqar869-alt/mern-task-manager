import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all task routes
router.use(authMiddleware);

// CREATE TASK
router.post("/", createTask);

// GET ALL TASKS
router.get("/", getTasks);

// UPDATE TASK
router.patch("/:id", updateTask);

// DELETE TASK
router.delete("/:id", deleteTask);

export default router;
