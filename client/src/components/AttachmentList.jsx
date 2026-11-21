import { useState } from "react";
import { Alert, Button, Stack, Typography } from "@mui/material";
import API from "../api/axios";
const formatSize = (bytes) => bytes >= 1024 * 1024
  ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default function AttachmentList({ taskId, attachments = [] }) {
  const [error, setError] = useState("");
  const openAttachment = async (attachment) => {
    try {
      setError("");
      const response = await API.get(`/tasks/${taskId}/attachments/${encodeURIComponent(attachment.filename)}`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.originalName;
      link.target = "_blank";
      link.rel = "noopener";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError(err.response?.status === 403 ? "You are not allowed to access this attachment." : "Could not open this attachment.");
    }
  };
  if (!attachments.length) return null;
  return <Stack spacing={0.5} sx={{ mt: 1 }}>
    <Typography variant="caption" fontWeight="bold">Attachments</Typography>
    {error && <Alert severity="error">{error}</Alert>}
    {attachments.map((attachment) => <Button key={attachment.filename} size="small" onClick={() => openAttachment(attachment)} sx={{ justifyContent: "flex-start", textTransform: "none", px: 0 }}>
      {attachment.originalName} · {attachment.mimetype.split("/").pop().toUpperCase()} · {formatSize(attachment.size)}
    </Button>)}
  </Stack>;
}
