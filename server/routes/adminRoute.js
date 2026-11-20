
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";

import {
  getAllUsers,
  updateUserRole,
  getAllTasks,
  updateTaskApproval,
} from "../controllers/adminController.js";

const router = express.Router();


router.use(authMiddleware, authorizeAdmin);


router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);

//for task 
router.get("/tasks", getAllTasks);
router.patch("/tasks/:id/approval", updateTaskApproval);

export default router;
