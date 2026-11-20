import mongoose from "mongoose";
import { signup, login } from "../controllers/userController.js";
import express from "express";
const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Auth route is working!");
});

router.post("/signup", signup);
router.post("/login", login);

export default router;
