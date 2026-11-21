
import mongoose from "mongoose";
import User from "../models/User.js";
import Task from "../models/task.js";
import bcrypt from "bcryptjs";
import { attachmentMetadata, removeUploadedFiles } from "../utils/attachments.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Get users error:", error.message);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};


//admin add user 
export const addUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
    });

    
    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
   
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A user with this email already exists",
      });
    }

    console.error("Add user error:", error.message);

    res.status(500).json({
      message: "Failed to create user",
    });
  }
};


export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Role must be user or admin",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user._id.toString() === req.user.id && role === "user") {
      return res.status(400).json({
        message: "You cannot demote yourself",
      });
    }

    if (user.role === "admin" && role === "user") {
      const adminCount = await User.countDocuments({
        role: "admin",
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot demote the last admin",
        });
      }
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: `User role updated to ${role} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update role error:", error.message);

    res.status(500).json({
      message: "Failed to update user role",
    });
  }
};


export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All tasks fetched successfully",
      tasks,
    });
  } catch (error) {
    console.error("Get all tasks error:", error.message);

    res.status(500).json({
      message: "Failed to fetch tasks",
    });
  }
};

export const assignTask = async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      priority,
      dueDate,
    } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      await removeUploadedFiles(req.files);
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }
   
    if (!title?.trim() || !description?.trim() || !dueDate) {
      await removeUploadedFiles(req.files);
      return res.status(400).json({
        message: "Title, description, and due date are required",
      });
    }

   
    if (
      priority &&
      !["low", "medium", "high"].includes(priority)
    ) {
      await removeUploadedFiles(req.files);
      return res.status(400).json({
        message: "Priority must be low, medium, or high",
      });
    }

    
    const assignedUser = await User.findById(userId);

    if (!assignedUser) {
      await removeUploadedFiles(req.files);
      return res.status(404).json({
        message: "Assigned user not found",
      });
    }

    
    const task = await Task.create({
      title,
      description,
      priority: priority || "medium",
      dueDate,
      user: assignedUser._id,

     
      status: "pending",
      approvalStatus: "approved",
      rejectionReason: "",
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      attachments: attachmentMetadata(req.files, req.user.id),
    });

    await task.populate("user", "name email");
    await task.populate("reviewedBy", "name email");

    res.status(201).json({
      message: "Task assigned successfully",
      task,
    });
  } catch (error) {
    await removeUploadedFiles(req.files);
    console.error("Assign task error:", error.message);

    res.status(400).json({
      message: error.message || "Failed to assign task",
    });
  }
};


export const updateTaskApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus, rejectionReason } = req.body;

    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID",
      });
    }

    
    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        message: "Approval status must be approved or rejected",
      });
    }

    if (
      approvalStatus === "rejected" &&
      (!rejectionReason || !rejectionReason.trim())
    ) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }
    
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }
    task.approvalStatus = approvalStatus;

    task.rejectionReason =
      approvalStatus === "rejected"
        ? rejectionReason.trim()
        : "";

    task.reviewedBy = req.user.id;
    task.reviewedAt = new Date();

    await task.save();

    await task.populate("user", "name email");
    await task.populate("reviewedBy", "name email");

    res.status(200).json({
      message: `Task ${approvalStatus} successfully`,
      task,
    });
  } catch (error) {
    console.error("Task approval error:", error.message);

    res.status(500).json({
      message: "Failed to update task approval",
    });
  }
};

