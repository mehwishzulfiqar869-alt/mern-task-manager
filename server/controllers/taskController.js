
import Task from "../models/task.js";


export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      user: req.user.id,

    
      status: "pending",
      approvalStatus: "pending",
      rejectionReason: "",
      reviewedBy: null,
      reviewedAt: null,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};


export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      approvalStatus,
      rejectionReason,
      reviewedBy,
      reviewedAt,
    } = req.body;

    
    if (
      approvalStatus !== undefined ||
      rejectionReason !== undefined ||
      reviewedBy !== undefined ||
      reviewedAt !== undefined
    ) {
      return res.status(403).json({
        message: "You are not allowed to change approval information",
      });
    }

    
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    
  
if (status !== undefined && status !== task.status) {
  if (task.approvalStatus !== "approved") {
    return res.status(403).json({
      message:
        "Task progress can only be changed after admin approval",
    });
  }

  task.status = status;
}

    
    if (priority !== undefined) {
      if (
        task.approvalStatus === "approved" &&
        priority !== task.priority
      ) {
        return res.status(403).json({
          message: "Only an admin can change approved task priority",
        });
      }

      if (task.approvalStatus !== "approved") {
        task.priority = priority;
      }
    }

    
    if (title !== undefined) {
      task.title = title;
    }

    if (description !== undefined) {
      task.description = description;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate;
    }

    const contentUpdated =
      title !== undefined ||
      description !== undefined ||
      dueDate !== undefined ||
      priority !== undefined;

    if (
      task.approvalStatus === "rejected" &&
      contentUpdated
    ) {
      task.approvalStatus = "pending";
      task.rejectionReason = "";
      task.reviewedBy = null;
      task.reviewedAt = null;
      task.status = "pending";
    }

    await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
