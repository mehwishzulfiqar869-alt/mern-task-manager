
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../context/TaskContext";
import TaskBoard from "../components/TaskBoard";
import AttachmentPicker from "../components/AttachmentPicker";
import AttachmentList from "../components/AttachmentList";

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

  const [viewMode, setViewMode] = useState("list");

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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [removedAttachments, setRemovedAttachments] = useState([]);

  // Validate title and description
  const validateTaskFields = ({ title, description }) => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      return "Task title is required.";
    }

    if (cleanTitle.length < 3) {
      return "Task title must be at least 3 characters.";
    }

    if (!cleanDescription) {
      return "Task description is required.";
    }

    if (cleanDescription.length < 5) {
      return "Description must be at least 5 characters.";
    }

    return "";
  };

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
    setSelectedFiles([]);
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

    const validationError = validateTaskFields(formData);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      setActionError("");
      setSuccessMessage("");

      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("description", formData.description.trim());
      payload.append("priority", formData.priority);
      if (formData.dueDate) payload.append("dueDate", formData.dueDate);
      selectedFiles.forEach((file) => payload.append("attachments", file));
      await addTask(payload);

      setFormData(initialFormData);
      setDialogType(null);
      setSuccessMessage("Task created successfully!");
    } catch (err) {
      setActionError("");
      setFormError(
        err.response?.data?.message || "Failed to create task"
      );
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
    setSelectedFiles([]);
    setRemovedAttachments([]);

    setDialogType("edit");
  };

  
  const handleEditClose = () => {
    if (updating) return;

    setDialogType(null);
    setEditingId(null);
    setEditError("");
  };

  
  const handleUpdate = async (event) => {
    event.preventDefault();

    const validationError = validateTaskFields(editData);

    if (validationError) {
      setEditError(validationError);
      return;
    }

    try {
      setUpdating(true);
      setEditError("");
      setActionError("");
      setSuccessMessage("");

      const payload = new FormData();
      Object.entries({ ...editData, title: editData.title.trim(), description: editData.description.trim() }).forEach(([key, value]) => {
        if (value !== undefined && value !== null) payload.append(key, value);
      });
      payload.append("removeAttachmentIds", JSON.stringify(removedAttachments));
      selectedFiles.forEach((file) => payload.append("attachments", file));
      await updateTask(editingId, payload);

      setDialogType(null);
      setEditingId(null);
      setSuccessMessage("Task updated successfully!");
    } catch (err) {
      setActionError("");
      setEditError(
        err.response?.data?.message || "Failed to update task"
      );
    } finally {
      setUpdating(false);
    }
  };

  
  const pendingTasks = tasks.filter(
    (task) => task.status === "pending"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;

  
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

        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        
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
                <Typography color="text.secondary">
                  Total Tasks
                </Typography>

                <Typography variant="h4" fontWeight="bold">
                  {tasks.length}
                </Typography>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography color="text.secondary">
                  Pending Tasks
                </Typography>

                <Typography variant="h4" color="warning.main">
                  {pendingTasks}
                </Typography>
              </Paper>

              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography color="text.secondary">
                  Completed Tasks
                </Typography>

                <Typography variant="h4" color="success.main">
                  {completedTasks}
                </Typography>
              </Paper>
            </Box>

<Stack
  direction={{ xs: "column", sm: "row" }}
  justifyContent="space-between"
  alignItems={{ xs: "stretch", sm: "center" }}
  spacing={2}
  sx={{ mb: 3, width: "100%" }}
>
  <Typography variant="h5" fontWeight="bold">
    My Tasks
  </Typography>

  <Stack direction="row" spacing={1} flexWrap="wrap">
    <Button
      variant={viewMode === "list" ? "contained" : "outlined"}
      onClick={() => setViewMode("list")}
    >
      List View
    </Button>

    <Button
      variant={viewMode === "board" ? "contained" : "outlined"}
      onClick={() => {
        setViewMode("board");
        setActiveFilter("all");
      }}
    >
      Board View
    </Button>

    <Button variant="contained" onClick={handleOpen}>
       Add Task
    </Button>
  </Stack>
</Stack>


             
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3, rowGap: 1 }}
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

            

           {viewMode === "board" ? (
  <TaskBoard tasks={tasks} updateTask={updateTask}onEdit={handleEditOpen} onDelete={handleDelete} deletingId={deletingId}/>
) : (
  <>
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
                    sx={{p: 3,borderRadius: 3,display: "flex",justifyContent: "space-between",alignItems: "center",
                      flexWrap: "wrap", gap: 2,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {task.title}
                      </Typography>

                      <Typography color="text.secondary">
                        {task.description}
                      </Typography>
                      <AttachmentList taskId={task._id} attachments={task.attachments} />

                      {task.dueDate && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      )}

                      {task.approvalStatus === "rejected" &&
                        task.rejectionReason && (
                          <Alert severity="error" sx={{ mt: 2 }}>
                            <strong>Admin Feedback:</strong> {task.rejectionReason}
                          </Alert>
                        )}
                    </Box>

                    <Stack
                      direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Chip
                        label={task.priority} color={task.priority === "high" ? "error": task.priority === "medium"
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

                        <Chip
                            label={`Admin Review: ${task.approvalStatus || "pending"}`}
                            color={
                              task.approvalStatus === "approved"? "success": task.approvalStatus === "rejected" ? "error" : "warning"
                            }
                          />


                      <Button
                        variant="outlined"color="primary"onClick={() => handleEditOpen(task)}
                        disabled={deletingId === task._id}
                      >
                        Edit
                      </Button>

                      <Button color="error" variant="outlined" disabled={deletingId === task._id}
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

  </>
)}
                   
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
                  inputProps={{ minLength: 3 }}
                />

                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  required
                  inputProps={{ minLength: 5 }}
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

                <Box>
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                    Due Date
                  </Typography>
                  <TextField
                    name="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ "aria-label": "Due Date" }}
                  />
                </Box>
                <AttachmentPicker files={selectedFiles} onChange={setSelectedFiles} />
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

                <TextField label="Task Title" name="title" value={editData.title}
                  onChange={handleEditChange}
                  fullWidth
                  required
                  inputProps={{ minLength: 3 }}
                />

                <TextField label="Description" name="description" value={editData.description}
                  onChange={handleEditChange}
                  fullWidth
                  multiline
                  rows={3}
                  required
                  inputProps={{ minLength: 5 }}
                />

                <TextField
                  select
                  label="Status" name="status" value={editData.status} onChange={handleEditChange}
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

                <Box>
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                    Due Date
                  </Typography>
                  <TextField
                    name="dueDate"
                    type="date"
                    value={editData.dueDate}
                    onChange={handleEditChange}
                    fullWidth
                    inputProps={{ "aria-label": "Due Date" }}
                  />
                </Box>
                {(() => {
                  const task = tasks.find((item) => item._id === editingId);
                  const retained = (task?.attachments || []).filter((item) => !removedAttachments.includes(item.filename));
                  return <>
                    <AttachmentList taskId={editingId} attachments={retained} />
                    {retained.map((item) => <Button key={item.filename} size="small" color="error" onClick={() => setRemovedAttachments((ids) => [...ids, item.filename])}>Remove {item.originalName}</Button>)}
                    <AttachmentPicker files={selectedFiles} onChange={setSelectedFiles} maxExisting={retained.length} />
                  </>;
                })()}
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
