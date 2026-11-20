import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../context/TaskContext";

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";

function Dashboard() {
  const navigate = useNavigate();

  const {
    tasks,
    loading,
    error,
    actionError,
    setActionError,
    addTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const [activeFilter, setActiveFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [dialogType, setDialogType] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formError, setFormError] = useState("");
  const [editError, setEditError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const initialFormData = {
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [editData, setEditData] = useState(initialFormData);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleEditChange = (event) => {
    setEditData({
      ...editData,
      [event.target.name]: event.target.value,
    });
  };

  const handleOpen = () => {
    setFormError("");
    setActionError("");
    setSuccessMessage("");
    setFormData(initialFormData);
    setDialogType("add");
  };

  // Close Add Task dialog
  const handleClose = () => {
    if (submitting) return;

    setDialogType(null);
    setFormError("");
  };

  // Create a new task using Context
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setFormError("Task title is required");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      setActionError("");
      setSuccessMessage("");

      await addTask({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || undefined,
      });

      setFormData(initialFormData);
      setDialogType(null);
      setSuccessMessage("Task created successfully!");
    } catch (err) {
      setActionError("");
      setFormError(err.response?.data?.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a task using Context
  const handleDelete = async (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(taskId);
      setActionError("");
      setSuccessMessage("");

      await deleteTask(taskId);

      setSuccessMessage("Task deleted successfully!");
    } catch {
      // TaskContext sets the action error
    } finally {
      setDeletingId(null);
    }
  };

  // Open Edit Task dialog
  const handleEditOpen = (task) => {
    setEditingId(task._id);
    setEditError("");
    setActionError("");
    setSuccessMessage("");

    setEditData({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "pending",
      priority: task.priority || "medium",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    });

    setDialogType("edit");
  };

  // Close Edit Task dialog
  const handleEditClose = () => {
    if (updating) return;

    setDialogType(null);
    setEditingId(null);
    setEditError("");
  };

  // Update a task using Context
  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editData.title.trim()) {
      setEditError("Task title is required");
      return;
    }

    try {
      setUpdating(true);
      setEditError("");
      setActionError("");
      setSuccessMessage("");

      await updateTask(editingId, {
        ...editData,
        title: editData.title.trim(),
        description: editData.description.trim(),
        dueDate: editData.dueDate || undefined,
      });

      setDialogType(null);
      setEditingId(null);
      setSuccessMessage("Task updated successfully!");
    } catch (err) {
      setActionError("");
      setEditError(err.response?.data?.message || "Failed to update task");
    } finally {
      setUpdating(false);
    }
  };

  // Task statistics
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "all") {
      return true;
    }

    return task.status === activeFilter;
  });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f6fa" }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ bgcolor: "#4338ca" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Task Manager
          </Typography>

          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome to Your Dashboard!
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Manage your tasks and stay productive.
        </Typography>

        {/* Success Message */}
        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        {/* Action Error */}
        {actionError && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() => setActionError("")}
          >
            {actionError}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 5,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {/* Task Statistics */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                },
                gap: 3,
                mb: 5,
              }}
            >
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography color="text.secondary">Total Tasks</Typography>

                <Typography variant="h4" fontWeight="bold">
                  {tasks.length}
                </Typography>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography color="text.secondary">Pending Tasks</Typography>

                <Typography variant="h4" color="warning.main">
                  {pendingTasks}
                </Typography>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography color="text.secondary">Completed Tasks</Typography>

                <Typography variant="h4" color="success.main">
                  {completedTasks}
                </Typography>
              </Paper>
            </Box>

            {/* Tasks Heading and Add Button */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3, width: "100%" }}
            >
              <Typography variant="h5" fontWeight="bold">
                My Tasks
              </Typography>

              <Button
                variant="contained"
                onClick={handleOpen}
                sx={{ ml: "auto" }}
              >
                + Add Task
              </Button>
            </Stack>

            {/* Task Filters */}
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              sx={{ mb: 3, rowGap: 1 }}
            >
              <Button
                variant={activeFilter === "all" ? "contained" : "outlined"}
                onClick={() => setActiveFilter("all")}
              >
                All ({tasks.length})
              </Button>

              <Button
                variant={activeFilter === "pending" ? "contained" : "outlined"}
                onClick={() => setActiveFilter("pending")}
              >
                Pending ({pendingTasks})
              </Button>

              <Button
                variant={
                  activeFilter === "completed" ? "contained" : "outlined"
                }
                onClick={() => setActiveFilter("completed")}
              >
                Completed ({completedTasks})
              </Button>
            </Stack>

            {/* Display Tasks */}
            {tasks.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">
                  You don't have any tasks yet. Add your first task!
                </Typography>
              </Paper>
            ) : filteredTasks.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No {activeFilter} tasks found.
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {filteredTasks.map((task) => (
                  <Paper
                    key={task._id}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {task.title}
                      </Typography>

                      <Typography color="text.secondary">
                        {task.description}
                      </Typography>

                      {task.dueDate && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <Chip
                        label={task.priority}
                        color={
                          task.priority === "high"
                            ? "error"
                            : task.priority === "medium"
                              ? "warning"
                              : "success"
                        }
                      />

                      <Chip
                        label={task.status}
                        color={
                          task.status === "completed" ? "success" : "default"
                        }
                      />

                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleEditOpen(task)}
                        disabled={deletingId === task._id}
                      >
                        Edit
                      </Button>

                      <Button
                        color="error"
                        variant="outlined"
                        disabled={deletingId === task._id}
                        onClick={() => handleDelete(task._id)}
                      >
                        {deletingId === task._id ? "Deleting..." : "Delete"}
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </>
        )}

        {/* ADD TASK DIALOG */}
        <Dialog
          open={dialogType === "add"}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
        >
          <Box component="form" onSubmit={handleSubmit}>
            <DialogTitle>Add New Task</DialogTitle>

            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                {formError && <Alert severity="error">{formError}</Alert>}

                <TextField
                  label="Task Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                />

                <TextField
                  select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>

                <TextField
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleClose} disabled={submitting}>
                Cancel
              </Button>

              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? "Saving..." : "Save Task"}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        {/* EDIT TASK DIALOG */}
        <Dialog
          open={dialogType === "edit"}
          onClose={handleEditClose}
          fullWidth
          maxWidth="sm"
        >
          <Box component="form" onSubmit={handleUpdate}>
            <DialogTitle>Edit Task</DialogTitle>

            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                {editError && <Alert severity="error">{editError}</Alert>}

                <TextField
                  label="Task Title"
                  name="title"
                  value={editData.title}
                  onChange={handleEditChange}
                  fullWidth
                  required
                />

                <TextField
                  label="Description"
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  fullWidth
                  multiline
                  rows={3}
                />

                <TextField
                  select
                  label="Status"
                  name="status"
                  value={editData.status}
                  onChange={handleEditChange}
                  fullWidth
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </TextField>

                <TextField
                  select
                  label="Priority"
                  name="priority"
                  value={editData.priority}
                  onChange={handleEditChange}
                  fullWidth
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </TextField>

                <TextField
                  label="Due Date"
                  name="dueDate"
                  type="date"
                  value={editData.dueDate}
                  onChange={handleEditChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleEditClose} disabled={updating}>
                Cancel
              </Button>

              <Button type="submit" variant="contained" disabled={updating}>
                {updating ? "Updating..." : "Update Task"}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Container>
    </Box>
  );
}

export default Dashboard;
