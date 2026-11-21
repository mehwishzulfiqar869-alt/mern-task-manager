import fs from "fs/promises";
import path from "path";
import { uploadFolder } from "../middleware/uploadMiddleware.js";

export const attachmentMetadata = (files = [], userId) => files.map((file) => ({
  originalName: file.originalname,
  filename: file.filename,
  mimetype: file.mimetype,
  size: file.size,
  path: file.filename,
  uploadedBy: userId,
}));

export const removeUploadedFiles = async (files = []) => Promise.all(files.map((file) =>
  fs.unlink(path.join(uploadFolder, path.basename(file.filename))).catch(() => {}),
));

export const removeAttachmentFiles = async (attachments = []) => Promise.all(attachments.map((attachment) =>
  fs.unlink(path.join(uploadFolder, path.basename(attachment.filename))).catch(() => {}),
));
