
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import AssignTaskDialog from "../components/admin/AssignTaskDialog";
import AddUserDialog from "../components/admin/AddUserDialog";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [usersLoading, setUsersLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  const [usersError, setUsersError] = useState("");
  const [tasksError, setTasksError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const currentUserId = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.id || user?._id || "";
    } catch {
      return "";
    }
  })();

  useEffect(() => {
    let ignore = false;

    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };

    const fetchUsers = async () => {
      try {
        const response = await API.get("/admin/users", config);

        if (!ignore) {
          setUsers(response.data.users || []);
        }
      } catch (err) {
        if (!ignore) {
          setUsersError(
            err.response?.data?.message ||
              "Failed to fetch users."
          );
        }
      } finally {
        if (!ignore) {
          setUsersLoading(false);
        }
      }
    };

    const fetchTasks = async () => {
      try {
        const response = await API.get("/admin/tasks", config);

        if (!ignore) {
          setTasks(response.data.tasks || []);
        }
      } catch (err) {
        if (!ignore) {
          setTasksError(
            err.response?.data?.message ||
              "Failed to fetch tasks."
          );
        }
      } finally {
        if (!ignore) {
          setTasksLoading(false);
        }
      }
    };

    fetchUsers();
    fetchTasks();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRoleChange = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";

    setActionError("");
    setSuccess("");
    setUpdatingUserId(user._id);

    try {
      const response = await API.patch(
        `/admin/users/${user._id}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setUsers((prevUsers) =>
        prevUsers.map((item) =>
          item._id === user._id
            ? { ...item, role: response.data.user.role }
            : item
        )
      );

      setSuccess(response.data.message);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Failed to update user role."
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleTaskApproval = async (
    task,
    approvalStatus,
    reason = ""
  ) => {
    setActionError("");
    setSuccess("");
    setUpdatingTaskId(task._id);

    try {
      const response = await API.patch(
        `/admin/tasks/${task._id}/approval`,
        {
          approvalStatus,
          rejectionReason: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setTasks((prevTasks) =>
        prevTasks.map((item) =>
          item._id === task._id ? response.data.task : item
        )
      );

      setSuccess(response.data.message);

      if (approvalStatus === "rejected") {
        setRejectDialogOpen(false);
        setSelectedTask(null);
        setRejectionReason("");
      }
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Failed to update task approval."
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const openRejectDialog = (task) => {
    setSelectedTask(task);
    setRejectionReason("");
    setActionError("");
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      setActionError("Please enter a rejection reason.");
      return;
    }

    handleTaskApproval(
      selectedTask,
      "rejected",
      rejectionReason.trim()
    );
  };

  const handleTaskAssigned = (newTask, message) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);

    setActionError("");
    setSuccess(message || "Task assigned successfully.");
  };

  const handleUserAdded = (newUser, message) => {
    setUsers((prevUsers) => [newUser, ...prevUsers]);

    setActionError("");
    setSuccess(message || "User created successfully.");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getApprovalColor = (status) => {
    if (status === "approved") return "success";
    if (status === "rejected") return "error";
    return "warning";
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>

          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 5 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexWrap: "wrap",
              gap: 2,
              width: "100%",
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Admin Dashboard
              </Typography>

              <Typography color="text.secondary">
                Manage registered users and review their tasks.
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1.5}
              sx={{ flexShrink: 0 }}
            >
              <Button
                variant="outlined"
                onClick={() => setAddUserDialogOpen(true)}
              >
                + Add User
              </Button>

              <Button
                variant="contained"
                onClick={() => setAssignDialogOpen(true)}
                disabled={usersLoading || users.length === 0}
              >
                + Assign Task
              </Button>
            </Stack>
          </Box>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography color="text.secondary">
              Total Users
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {users.length}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography color="text.secondary">
              Administrators
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {users.filter((user) => user.role === "admin").length}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography color="text.secondary">
              Total Tasks
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {tasks.length}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography color="text.secondary">
              Awaiting Review
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {tasks.filter(
                (task) => (task.approvalStatus || "pending") === "pending"
              ).length}
            </Typography>
          </Paper>
        </Stack>

        
        {actionError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setActionError("")}
          >
            {actionError}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}

        
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            User Management
          </Typography>

          {usersError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {usersError}
            </Alert>
          )}

          <TableContainer component={Paper}>
            {usersLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell><strong>Registered</strong></TableCell>
                    <TableCell align="center">
                      <strong>Action</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      const isCurrentUser =
                        currentUserId === user._id;

                      return (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>

                          <TableCell>
                            <Chip
                              label={user.role}
                              color={
                                user.role === "admin"
                                  ? "primary"
                                  : "default"
                              }
                            />
                          </TableCell>

                          <TableCell>
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "—"}
                          </TableCell>

                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="contained"
                              color={
                                user.role === "admin"
                                  ? "warning"
                                  : "success"
                              }
                              disabled={
                                updatingUserId !== null ||
                                isCurrentUser
                              }
                              onClick={() => handleRoleChange(user)}
                            >
                              {updatingUserId === user._id ? (
                                <CircularProgress
                                  size={18}
                                  color="inherit"
                                />
                              ) : user.role === "admin" ? (
                                "Demote"
                              ) : (
                                "Promote"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Box>

        
        <Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Task Management
              </Typography>

              <Typography color="text.secondary">
                Review submitted tasks or assign new tasks to users.
              </Typography>
            </Box>
          </Stack>

          {tasksError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {tasksError}
            </Alert>
          )}

          <TableContainer component={Paper}>
            {tasksLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Task</strong></TableCell>
                    <TableCell><strong>Owner</strong></TableCell>
                    <TableCell><strong>Progress</strong></TableCell>
                    <TableCell><strong>Priority</strong></TableCell>
                    <TableCell><strong>Approval</strong></TableCell>
                    <TableCell><strong>Rejection Reason</strong></TableCell>
                    <TableCell align="center">
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {tasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No tasks found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks.map((task) => {
                      const approvalStatus =
                        task.approvalStatus || "pending";

                      return (
                        <TableRow key={task._id}>
                          <TableCell>
                            <Typography fontWeight="bold">
                              {task.title}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {task.description}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            {task.user?.name || "Unknown user"}
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {task.user?.email || ""}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={task.status}
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={task.priority}
                              color={
                                task.priority === "high"
                                  ? "error"
                                  : task.priority === "medium"
                                  ? "warning"
                                  : "success"
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={approvalStatus}
                              color={getApprovalColor(approvalStatus)}
                            />
                          </TableCell>

                          <TableCell>
                            {task.rejectionReason || "—"}
                          </TableCell>

                          <TableCell align="center">
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="center"
                            >
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                disabled={
                                  updatingTaskId !== null ||
                                  approvalStatus === "approved"
                                }
                                onClick={() =>
                                  handleTaskApproval(task, "approved")
                                }
                              >
                                {updatingTaskId === task._id ? (
                                  <CircularProgress
                                    size={16}
                                    color="inherit"
                                  />
                                ) : (
                                  "Approve"
                                )}
                              </Button>

                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                disabled={
                                  updatingTaskId !== null ||
                                  approvalStatus === "rejected"
                                }
                                onClick={() => openRejectDialog(task)}
                              >
                                Reject
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Box>
      </Container>

      
      <AssignTaskDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        users={users}
        onAssigned={handleTaskAssigned}
      />

      
      <AddUserDialog
        open={addUserDialogOpen}
        onClose={() => setAddUserDialogOpen(false)}
        onAdded={handleUserAdded}
      />

      
      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          if (updatingTaskId === null) {
            setRejectDialogOpen(false);
            setSelectedTask(null);
            setRejectionReason("");
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reject Task</DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Please provide a reason for rejecting:
            {" "}
            <strong>{selectedTask?.title}</strong>
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Rejection reason"
            placeholder="Explain why this task is rejected..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setSelectedTask(null);
              setRejectionReason("");
              setActionError("");
            }}
            disabled={updatingTaskId !== null}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleRejectSubmit}
            disabled={
              updatingTaskId !== null ||
              !rejectionReason.trim()
            }
          >
            {updatingTaskId !== null ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Confirm Rejection"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AdminDashboard;
