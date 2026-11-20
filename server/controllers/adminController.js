
import mongoose from "mongoose";
import User from "../models/User.js";
import Task from "../models/task.js";


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


// Approve or reject  task
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

