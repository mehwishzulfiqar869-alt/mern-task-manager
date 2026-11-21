
import Task from "../models/task.js";
import path from "path";
import fs from "fs/promises";
import { uploadFolder } from "../middleware/uploadMiddleware.js";
import { attachmentMetadata, removeUploadedFiles, removeAttachmentFiles } from "../utils/attachments.js";


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
      attachments: attachmentMetadata(req.files, req.user.id),
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    await removeUploadedFiles(req.files);
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
      await removeUploadedFiles(req.files);
      return res.status(403).json({
        message: "You are not allowed to change approval information",
      });
    }

    
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      await removeUploadedFiles(req.files);
      return res.status(404).json({
        message: "Task not found",
      });
    }

    
  
if (status !== undefined && status !== task.status) {
  if (task.approvalStatus !== "approved") {
    await removeUploadedFiles(req.files);
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
        await removeUploadedFiles(req.files);
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

    let removeAttachmentIds = [];
    try {
      removeAttachmentIds = req.body.removeAttachmentIds ? JSON.parse(req.body.removeAttachmentIds) : [];
    } catch {
      await removeUploadedFiles(req.files);
      return res.status(400).json({ message: "Invalid attachment removal request" });
    }
    if (!Array.isArray(removeAttachmentIds) || removeAttachmentIds.some((id) => typeof id !== "string")) {
      await removeUploadedFiles(req.files);
      return res.status(400).json({ message: "Invalid attachment removal request" });
    }
    const uniqueRemovalIds = [...new Set(removeAttachmentIds)];
    const validRemovalIds = uniqueRemovalIds.filter((id) => task.attachments.some((item) => item.filename === id));
    if (task.attachments.length - validRemovalIds.length + (req.files?.length || 0) > 5) {
      await removeUploadedFiles(req.files);
      return res.status(400).json({ message: "A task can have at most 5 attachments." });
    }
    const removed = task.attachments.filter((item) => validRemovalIds.includes(item.filename));
    task.attachments = task.attachments.filter((item) => !validRemovalIds.includes(item.filename));
    task.attachments.push(...attachmentMetadata(req.files, req.user.id));

    const contentUpdated =
      title !== undefined ||
      description !== undefined ||
      dueDate !== undefined ||
      priority !== undefined;
    const attachmentsUpdated = Boolean(req.files?.length || removed.length);

    if (
      task.approvalStatus === "rejected" &&
      (contentUpdated || attachmentsUpdated)
    ) {
      task.approvalStatus = "pending";
      task.rejectionReason = "";
      task.reviewedBy = null;
      task.reviewedAt = null;
      task.status = "pending";
    }

    await task.save();

    await removeAttachmentFiles(removed);

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    await removeUploadedFiles(req.files);
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

    await removeAttachmentFiles(task.attachments);

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const downloadAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).select("user attachments");
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (req.user.role !== "admin" && task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to access this attachment" });
    }
    const attachment = task.attachments.find((item) => item.filename === req.params.filename);
    if (!attachment) return res.status(404).json({ message: "Attachment not found" });
    const safePath = path.join(uploadFolder, path.basename(attachment.filename));
    await fs.access(safePath);
    return res.download(safePath, attachment.originalName);
  } catch (error) {
    return res.status(error.code === "ENOENT" ? 404 : 500).json({ message: error.code === "ENOENT" ? "Attachment file is missing" : "Failed to download attachment" });
  }
};
