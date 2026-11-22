
import mongoose from "mongoose";


const attachmentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
    },

    filename: {
      type: String,
      required: true,
    },

    mimetype: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    path: {
      type: String,
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [6, "Description must be at least 6 characters"],
    },

    
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
      required: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    dueDate: {
      type: Date,
      required: true,
    },

    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    
    reviewedAt: {
      type: Date,
      default: null,
    },

    attachments:{
      type:[attachmentSchema],
      default:[]
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
