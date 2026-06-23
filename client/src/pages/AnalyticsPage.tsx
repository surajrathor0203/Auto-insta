import { Grid2, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/resources";

export function AnalyticsPage() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });
  const status = [
    { name: "Published", value: data?.publishedPosts ?? 0, color: "#16a34a" },
    { name: "Scheduled", value: data?.scheduledPosts ?? 0, color: "#4f46e5" },
    { name: "Failed", value: data?.failedPosts ?? 0, color: "#dc2626" }
  ];
  return (
    <Stack spacing={3}>
      <Typography variant="h4">Analytics</Typography>
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2.5, height: 360 }}>
            <Typography variant="h6">Publishing mix</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <PieChart>
                <Pie data={status} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110}>
                  {status.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2.5, height: 360 }}>
            <Typography variant="h6">Top trends</Typography>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={data?.topTrends ?? []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.16} />
                <XAxis dataKey="title" tickFormatter={(v) => String(v).slice(0, 10)} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid2>
      </Grid2>
    </Stack>
  );
}
