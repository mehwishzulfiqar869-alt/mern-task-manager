
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeAdmin from "../middleware/authorizeAdmin.js";

import {
  getAllUsers,
  updateUserRole,
  getAllTasks,
  updateTaskApproval,
  addUser,
  assignTask ,
} from "../controllers/adminController.js";

const router = express.Router();


router.use(authMiddleware, authorizeAdmin);


router.get("/users", getAllUsers);
router.post("/users" , addUser);
router.patch("/users/:id/role", updateUserRole);


router.get("/tasks", getAllTasks);
router.post("/tasks/assign" , assignTask)
router.patch("/tasks/:id/approval", updateTaskApproval);

export default router;
