import { Grid2, Paper, Stack, Typography } from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InstagramIcon from "@mui/icons-material/Instagram";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/resources";
import { MetricCard } from "../components/MetricCard";

export function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });
  const chart = data?.topTrends.map((trend) => ({ name: trend.title.slice(0, 18), score: trend.score })) ?? [];
  return (
    <Stack spacing={3}>
      <Stack>
        <Typography variant="h4">Publishing dashboard</Typography>
        <Typography color="text.secondary">Live operating view for scheduled content, trend momentum, and channel health.</Typography>
      </Stack>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}><MetricCard label="Total posts" value={data?.totalPosts ?? 0} icon={<ArticleIcon />} loading={isLoading} /></Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}><MetricCard label="Scheduled" value={data?.scheduledPosts ?? 0} icon={<ScheduleIcon />} loading={isLoading} /></Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}><MetricCard label="Published" value={data?.publishedPosts ?? 0} icon={<CheckCircleIcon />} loading={isLoading} /></Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}><MetricCard label="Failed" value={data?.failedPosts ?? 0} icon={<ErrorIcon />} loading={isLoading} /></Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}><MetricCard label="Accounts" value={data?.connectedAccounts ?? 0} icon={<InstagramIcon />} loading={isLoading} /></Grid2>
        <Grid2 size={{ xs: 12, sm: 6, md: 2 }}><MetricCard label="AI posts" value={data?.aiGenerated ?? 0} icon={<AutoAwesomeIcon />} loading={isLoading} /></Grid2>
      </Grid2>
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2.5, height: 360 }}>
            <Typography variant="h6" mb={2}>Top trend score</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={chart}>
                <defs><linearGradient id="score" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" fillOpacity={1} fill="url(#score)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.5, height: 360, overflow: "auto" }}>
            <Typography variant="h6" mb={2}>Top trends</Typography>
            <Stack spacing={1.5}>
              {data?.topTrends.map((trend) => (
                <Paper key={trend._id} variant="outlined" sx={{ p: 1.5, bgcolor: "transparent" }}>
                  <Typography fontWeight={700}>{trend.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{trend.source} · score {trend.score}</Typography>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid2>
      </Grid2>
    </Stack>
  );
}
