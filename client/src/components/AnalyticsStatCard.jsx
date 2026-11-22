import { Paper, Typography } from "@mui/material";

export default function AnalyticsStatCard({ title, value, color }) {
  return (
    <Paper sx={{ p: 2.5, borderTop: 4, borderColor: color, height: "100%" }}>
      <Typography color="text.secondary" variant="body2">{title}</Typography>
      <Typography variant="h3" fontWeight={700} sx={{ mt: 1 }}>{value}</Typography>
    </Paper>
  );
}
