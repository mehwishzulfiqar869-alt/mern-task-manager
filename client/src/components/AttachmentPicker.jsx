import { useRef, useState } from "react";
import { Alert, Button, Chip, Stack, Typography } from "@mui/material";

const allowedExtensions = /\.(pdf|jpe?g|png|docx?)$/i;
const formatSize = (bytes) => bytes >= 1024 * 1024
  ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  : `${Math.max(1, Math.round(bytes / 1024))} KB`;
export default function AttachmentPicker({ files, onChange, maxExisting = 0 }) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const selectFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    const invalid = selected.find((file) => !allowedExtensions.test(file.name));
    if (invalid) return setError(`${invalid.name}: unsupported file type. Use PDF, JPG, JPEG, PNG, DOC, or DOCX.`);
    const oversized = selected.find((file) => file.size > 5 * 1024 * 1024);
    if (oversized) return setError(`${oversized.name} exceeds the 5 MB limit.`);
    if (maxExisting + files.length + selected.length > 5) return setError("A task can have at most 5 attachments.");
    setError("");
    onChange([...files, ...selected]);
  };
  return <Stack spacing={1}>
    <Button variant="outlined" component="label" onClick={(event) => { event.preventDefault(); inputRef.current?.click(); }} sx={{ alignSelf: "flex-start" }}>Add attachments</Button>
    <input ref={inputRef} hidden type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={selectFiles} />
    <Typography variant="caption" color="text.secondary">PDF, JPG, JPEG, PNG, DOC, DOCX · up to 5 files · 5 MB each</Typography>
    {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
    {files.map((file, index) => <Chip key={`${file.name}-${index}`} label={`${file.name} (${formatSize(file.size)})`} onDelete={() => onChange(files.filter((_, i) => i !== index))} />)}
  </Stack>;
}
