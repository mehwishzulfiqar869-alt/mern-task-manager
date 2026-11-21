
import { useState } from "react";
import API from "../../api/axios";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

function AddUserDialog({ open, onClose, onAdded }) {
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    if (submitting) return;

    setFormData(initialForm);
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await API.post(
        "/admin/users",
        {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      onAdded(response.data.user, response.data.message);

      setFormData(initialForm);
      setError("");
      onClose();
    }catch (err) {
  console.error("Add user error:", err);

  setError(
    err.response?.data?.message ||
      err.message ||
      "Failed to create user. Please try again."
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
      <DialogTitle>Add New User</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              required
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              inputProps={{ minLength: 2 }}
            />

            <TextField
              fullWidth
              required
              name="email"
              type="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />

            <TextField
              fullWidth
              required
              name="password"
              type="password"
              label="Temporary Password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              inputProps={{ minLength: 6 }}
              helperText="Password must contain at least 6 characters."
            />
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
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Create User"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddUserDialog;
