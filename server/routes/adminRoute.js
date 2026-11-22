
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";
import { uploadAttachments } from "../middleware/uploadMiddleware.js";

import {
  getAllUsers,
  updateUserRole,
  getAllTasks,
  updateTaskApproval,
  addUser,
  assignTask ,
  getTaskAnalytics,
} from "../controllers/adminController.js";

const router = express.Router();


router.use(authMiddleware, authorizeAdmin);


router.get("/users", getAllUsers);
router.post("/users" , addUser);
router.patch("/users/:id/role", updateUserRole);


router.get("/tasks", getAllTasks);
router.get("/analytics", getTaskAnalytics);
router.post("/tasks/assign" , uploadAttachments, assignTask)
router.patch("/tasks/:id/approval", updateTaskApproval);

export default router;
