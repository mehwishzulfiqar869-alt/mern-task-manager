import { createContext, useContext, useState, useEffect } from "react";

import API from "../api/axios";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  // Fetch tasks when Provider loads
  useEffect(() => {
    let ignore = false;

    async function loadTasks() {
      try {
        const response = await API.get("/tasks");

        if (!ignore) {
          setTasks(response.data.tasks || []);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to fetch tasks");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      ignore = true;
    };
  }, []);

  const addTask = async (taskData) => {
    try {
      setActionError("");

      const response = await API.post("/tasks", taskData);

      const newTask = response.data.task;

      setTasks((previousTasks) => [newTask, ...previousTasks]);

      return newTask;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to add task";

      setActionError(message);
      throw err;
    }
  };

  // Update an existing task
  const updateTask = async (taskId, taskData) => {
    try {
      setActionError("");

      const response = await API.patch(`/tasks/${taskId}`, taskData);

      const updatedTask = response.data.task;

      setTasks((previousTasks) =>
        previousTasks.map((task) => (task._id === taskId ? updatedTask : task)),
      );

      return updatedTask;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update task";

      setActionError(message);
      throw err;
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      setActionError("");

      await API.delete(`/tasks/${taskId}`);

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== taskId),
      );
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete task";

      setActionError(message);
      throw err;
    }
  };

  // Values shared with components
  const value = {
    tasks,
    loading,
    error,
    actionError,
    addTask,
    updateTask,
    deleteTask,
    setActionError,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTasks() {
  return useContext(TaskContext);
}
