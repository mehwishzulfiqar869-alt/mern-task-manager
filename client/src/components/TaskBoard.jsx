
import {
  DragDropProvider,
  useDraggable,
  useDroppable,
} from "@dnd-kit/react";

import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
} from "@mui/material";

const columns = [
  { id: "pending", title: "Pending" },
  { id: "in-progress", title: "In Progress" },
  { id: "completed", title: "Completed" },
];

function TaskCard({ task, onEdit, onDelete, deletingId }) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: String(task._id),
  });

  return (
    <Paper
      ref={ref}
      elevation={isDragging ? 5 : 1}
      sx={{
        p: 2,
        borderRadius: 2,
        opacity: isDragging ? 0.5 : 1,
        cursor: "default",
        bgcolor: "white",
      }}
    >
      <Stack spacing={1.5}>
        <Box display="flex" justifyContent="space-between" gap={1}>
          <Typography fontWeight="bold" sx={{ overflowWrap: "anywhere" }}>
            {task.title}
          </Typography>

          <Button
            ref={handleRef}
            size="small"
            variant="outlined"
            sx={{ minWidth: "auto", cursor: "grab" }}
          >
            Drag
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {task.description}
        </Typography>

        {task.dueDate && (
          <Typography variant="caption" color="text.secondary">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </Typography>
        )}

        <Box>
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
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onEdit(task)}
          >
            Edit
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="error"
            disabled={deletingId === task._id}
            onClick={() => onDelete(task._id)}
          >
            {deletingId === task._id ? "Deleting..." : "Delete"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function TaskColumn({ column, tasks, onEdit, onDelete, deletingId }) {
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
  });

  return (
    <Paper
      ref={ref}
      variant="outlined"
      sx={{
        p: 2,
        minHeight: 300,
        borderRadius: 3,
        bgcolor: isDropTarget ? "#e0e7ff" : "#f8fafc",
        border: isDropTarget ? "2px dashed #4338ca" : "1px solid #ddd",
        transition: "background-color 0.2s",
      }}
    >
      <Stack spacing={2}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            {column.title}
          </Typography>

          <Chip
            size="small"
            label={tasks.length}
          />
        </Box>

        {tasks.length === 0 ? (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">
              Drop tasks here
            </Typography>
          </Box>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              deletingId={deletingId}
            />
          ))
        )}
      </Stack>
    </Paper>
  );
}

function TaskBoard({
  tasks,
  updateTask,
  onEdit,
  onDelete,
  deletingId,
}) {
  const handleDragEnd = async (event) => {
    if (event.canceled) return;

    const taskId = String(event.operation.source?.id);
    const newStatus = String(event.operation.target?.id || "");

    const validStatuses = columns.map((column) => column.id);

    if (!validStatuses.includes(newStatus)) return;

    const task = tasks.find(
      (item) => String(item._id) === taskId
    );

    if (!task || task.status === newStatus) return;

    try {
      await updateTask(task._id, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        dueDate: task.dueDate || undefined,
      });
    } catch {
      // TaskContext handles and displays the API error.
    }
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            column={column}
            tasks={tasks.filter(
              (task) => task.status === column.id
            )}
            onEdit={onEdit}
            onDelete={onDelete}
            deletingId={deletingId}
          />
        ))}
      </Box>
    </DragDropProvider>
  );
}

export default TaskBoard;
