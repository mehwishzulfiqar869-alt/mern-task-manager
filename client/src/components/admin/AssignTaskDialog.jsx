
import { useState } from "react";
import API from "../../api/axios";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";

const initialFormData = {
  userId: "",
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
};

function AssignTaskDialog({ open, onClose, users, onAssigned }) {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  
  const regularUsers = users.filter((user) => user.role === "user");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    if (submitting) return;

    setFormData(initialFormData);
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.userId) {
      setError("Please select a user.");
      return;
    }

    if (formData.title.trim().length < 5) {
      setError("Task title must be at least 5 characters.");
      return;
    }

    if (formData.description.trim().length < 6) {
      setError("Description must be at least 6 characters.");
      return;
    }

    if (!formData.dueDate) {
      setError("Please select a due date.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await API.post(
        "/admin/tasks/assign",
        {
          ...formData,
          title: formData.title.trim(),
          description: formData.description.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      onAssigned(response.data.task, response.data.message);

      setFormData(initialFormData);
      setError("");
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to assign task. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Assign Task to User</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <TextField
              select
              fullWidth
              required
              name="userId"
              label="Select User"
              value={formData.userId}
              onChange={handleChange}
            >
              {regularUsers.length === 0 ? (
                <MenuItem disabled value="">
                  No regular users available
                </MenuItem>
              ) : (
                regularUsers.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              fullWidth
              required
              name="title"
              label="Task Title"
              value={formData.title}
              onChange={handleChange}
              inputProps={{ minLength: 5 }}
            />

            <TextField
              fullWidth
              required
              multiline
              minRows={3}
              name="description"
              label="Task Description"
              value={formData.description}
              onChange={handleChange}
              inputProps={{ minLength: 6 }}
            />

            <TextField
              select
              fullWidth
              name="priority"
              label="Priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </TextField>

            <Box>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    Due Date
                    </Typography>

                <TextField
                fullWidth
                required
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                inputProps={{
                min: new Date().toISOString().split("T")[0],
                }}
                />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={submitting || regularUsers.length === 0}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Assign Task"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AssignTaskDialog;
