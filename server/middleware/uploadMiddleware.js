import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
export const uploadFolder = path.resolve(serverDirectory, "../uploads");
fs.mkdirSync(uploadFolder, { recursive: true });

const allowedTypes = new Set([
  "application/pdf", "image/jpeg", "image/png", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const allowedExtensions = new Set([".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadFolder),
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  fileFilter: (_req, file, cb) => {
    const allowed = allowedTypes.has(file.mimetype) && allowedExtensions.has(path.extname(file.originalname).toLowerCase());
    cb(allowed ? null : new Error("Only PDF, JPG, JPEG, PNG, DOC, and DOCX files are allowed."), allowed);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

export const uploadAttachments = upload.array("attachments", 5);
