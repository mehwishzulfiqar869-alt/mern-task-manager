import { Box, Paper, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_COLORS = ["#f59e0b", "#3b82f6", "#10b981"];

function EmptyChart({ message }) {
  return <Box sx={{ height: 300, display: "grid", placeItems: "center" }}>
    <Typography color="text.secondary">{message}</Typography>
  </Box>;
}

export function TaskStatusChart({ counts }) {
  const data = [
    { name: "Pending", value: counts.pending },
    { name: "In Progress", value: counts["in-progress"] },
    { name: "Completed", value: counts.completed },
  ];
  const hasTasks = data.some((item) => item.value > 0);

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, height: "100%" }}>
      <Typography variant="h6" fontWeight={700}>Task Status Distribution</Typography>
      {hasTasks ? (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="46%" outerRadius="68%" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {data.map((entry, index) => <Cell key={entry.name} fill={STATUS_COLORS[index]} />)}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      ) : <EmptyChart message="No tasks to show yet." />}
    </Paper>
  );
}

export function TaskActivityChart({ activity, range }) {
  const formatDate = (dateKey) => {
    const date = new Date(`${dateKey}${range === "monthly" ? "-01" : ""}T00:00:00Z`);
    return new Intl.DateTimeFormat(undefined, range === "weekly"
      ? { month: "short", day: "numeric", timeZone: "UTC" }
      : { month: "short", year: "2-digit", timeZone: "UTC" }).format(date);
  };
  const hasActivity = activity.some((item) => item.created || item.completed);

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, height: "100%" }}>
      <Typography variant="h6" fontWeight={700}>Task Activity Over Time</Typography>
      {hasActivity ? (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={activity} margin={{ top: 16, right: 8, left: -16, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} minTickGap={12} />
            <YAxis allowDecimals={false} />
            <Tooltip labelFormatter={(label) => formatDate(label)} />
            <Legend />
            <Bar dataKey="created" name="Tasks Created" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" name="Tasks Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : <EmptyChart message={`No task activity in the selected ${range} period.`} />}
    </Paper>
  );
}
