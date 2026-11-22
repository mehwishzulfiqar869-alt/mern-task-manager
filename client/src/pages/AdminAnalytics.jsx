import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import API from "../api/axios";
import AnalyticsStatCard from "../components/AnalyticsStatCard";
import { TaskActivityChart, TaskStatusChart } from "../components/AnalyticsCharts";

const initialData = {
  statusCounts: { pending: 0, "in-progress": 0, completed: 0 },
  activity: [],
};

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [range, setRange] = useState("weekly");
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    API.get(`/admin/analytics?range=${range}`, { signal: controller.signal })
      .then((response) => setData(response.data))
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") {
          setError(err.response?.data?.message || "Failed to load analytics.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [range, refreshKey]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f6fa" }}>
      <AppBar position="static" sx={{ bgcolor: "#4338ca" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Task Analytics</Typography>
          <Button color="inherit" onClick={() => navigate("/admin")}>Admin Dashboard</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Analytics</Typography>
            <Typography color="text.secondary">Task progress and activity across your workspace.</Typography>
          </Box>
          <ToggleButtonGroup
            exclusive
            value={range}
            onChange={(_event, value) => { if (value) { setLoading(true); setError(""); setRange(value); } }}
            aria-label="Activity time range"
            size="small"
          >
            <ToggleButton value="weekly">Weekly</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={() => { setLoading(true); setError(""); setRefreshKey((key) => key + 1); }}>Retry</Button>}>{error}</Alert>}

        {loading ? (
          <Paper sx={{ minHeight: 280, display: "grid", placeItems: "center" }}><CircularProgress /></Paper>
        ) : error ? null : (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 2, mb: 3 }}>
              <AnalyticsStatCard title="Pending Tasks" value={data.statusCounts.pending} color="#f59e0b" />
              <AnalyticsStatCard title="In Progress Tasks" value={data.statusCounts["in-progress"]} color="#3b82f6" />
              <AnalyticsStatCard title="Completed Tasks" value={data.statusCounts.completed} color="#10b981" />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 0.85fr) minmax(0, 1.15fr)" }, gap: 2 }}>
              <TaskStatusChart counts={data.statusCounts} />
              <TaskActivityChart activity={data.activity} range={range} />
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
