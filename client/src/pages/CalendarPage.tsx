import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid2,
  MenuItem,
  Paper,
  Slider,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { api } from "../api/resources";
import { useUiStore } from "../store/uiStore";
import type { Schedule } from "../types";

const frequencies: Array<Schedule["frequency"] | "all"> = ["all", "once", "daily", "weekly", "monthly"];

function defaultTimes(count: number): string[] {
  const slots = ["09:00", "12:00", "15:00", "18:00", "21:00"];
  return slots.slice(0, count);
}

export function CalendarPage() {
  // ── Manual scheduler state ──
  const [postId, setPostId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [frequency, setFrequency] = useState<"once" | "daily" | "weekly" | "monthly">("once");
  const [filterFreq, setFilterFreq] = useState<Schedule["frequency"] | "all">("all");

  // ── Autopilot form state ──
  const [apNiche, setApNiche] = useState("");
  const [apPostsPerDay, setApPostsPerDay] = useState(1);
  const [apTimes, setApTimes] = useState<string[]>(["09:00"]);
  const [apAccountId, setApAccountId] = useState("");

  const queryClient = useQueryClient();
  const notify = useUiStore((s) => s.notify);

  const { data: posts = [] } = useQuery({ queryKey: ["posts"], queryFn: api.posts });
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: api.accounts });
  const { data: schedules = [], isLoading } = useQuery({ queryKey: ["schedules"], queryFn: api.schedules });
  const { data: autopilot, isLoading: apLoading } = useQuery({ queryKey: ["autopilot"], queryFn: api.getAutopilot });

  // Populate form when autopilot config loads
  useEffect(() => {
    if (autopilot) {
      setApNiche(autopilot.niche);
      setApPostsPerDay(autopilot.postsPerDay);
      setApTimes(autopilot.postingTimes);
      setApAccountId(autopilot.instagramAccountId);
    }
  }, [autopilot]);

  // Sync time slots count with postsPerDay
  useEffect(() => {
    setApTimes((prev) => {
      if (prev.length === apPostsPerDay) return prev;
      if (prev.length < apPostsPerDay) return [...prev, ...defaultTimes(apPostsPerDay).slice(prev.length)];
      return prev.slice(0, apPostsPerDay);
    });
  }, [apPostsPerDay]);

  const scheduleMutation = useMutation({
    mutationFn: api.schedulePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      notify("Post scheduled");
      setPostId("");
      setAccountId("");
      setScheduledAt("");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      notify("Schedule deleted");
    }
  });

  const saveApMutation = useMutation({
    mutationFn: api.saveAutopilot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autopilot"] });
      notify("Autopilot settings saved");
    }
  });

  const updateTimesMutation = useMutation({
    mutationFn: api.saveAutopilot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autopilot"] });
      notify("Posting schedule updated");
    }
  });

  const toggleApMutation = useMutation({
    mutationFn: api.toggleAutopilot,
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["autopilot"] });
      notify(updated.isActive ? "Autopilot enabled — posts will generate daily at 6:30 AM" : "Autopilot paused");
    }
  });

  const runApMutation = useMutation({
    mutationFn: api.runAutopilot,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      notify(`Autopilot generated ${result.generated} post${result.generated !== 1 ? "s" : ""} and scheduled them`);
    }
  });

  const filtered = filterFreq === "all" ? schedules : schedules.filter((s) => s.frequency === filterFreq);

  return (
    <Stack spacing={3}>
      {/* ── Autopilot Panel ── */}
      <Paper sx={{ p: 3, border: "1px solid", borderColor: autopilot?.isActive ? "primary.main" : "divider" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <AutoAwesomeIcon color="primary" />
            <Box>
              <Typography variant="h6">AI Autopilot</Typography>
              <Typography variant="body2" color="text.secondary">
                Set your niche and schedule — AI generates unique posts and publishes them automatically every day.
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" gap={1}>
            {autopilot && (
              <Chip
                size="small"
                label={autopilot.isActive ? "Active" : "Paused"}
                color={autopilot.isActive ? "success" : "default"}
              />
            )}
            <Tooltip title={autopilot ? (autopilot.isActive ? "Pause autopilot" : "Enable autopilot") : "Save settings first"}>
              <span>
                <Switch
                  checked={autopilot?.isActive ?? false}
                  disabled={!autopilot || toggleApMutation.isPending}
                  onChange={() => toggleApMutation.mutate()}
                  color="primary"
                />
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {apLoading ? (
          <Stack alignItems="center" py={2}><CircularProgress size={28} /></Stack>
        ) : (
          <Grid2 container spacing={2.5}>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Instagram account"
                select
                value={apAccountId}
                onChange={(e) => setApAccountId(e.target.value)}
              >
                {accounts.length === 0 ? (
                  <MenuItem disabled>No accounts — connect one in Settings</MenuItem>
                ) : (
                  accounts.map((acc) => (
                    <MenuItem key={acc._id} value={acc._id}>@{acc.username}</MenuItem>
                  ))
                )}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Audience niche"
                placeholder="e.g. SaaS founders, fitness coaches..."
                value={apNiche}
                onChange={(e) => setApNiche(e.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Posts per day: <strong>{apPostsPerDay}</strong>
              </Typography>
              <Slider
                value={apPostsPerDay}
                min={1} max={5} step={1}
                marks={[1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) }))}
                onChange={(_, v) => setApPostsPerDay(v as number)}
              />
            </Grid2>

            {/* Time slots — one per post */}
            <Grid2 size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary" mb={1.5}>
                <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} />
                Posting times — edit any time and click "Update schedule"
              </Typography>
              <Stack direction="row" gap={2} flexWrap="wrap" alignItems="center">
                {apTimes.map((time, i) => (
                  <TextField
                    key={i}
                    type="time"
                    label={`Post ${i + 1}`}
                    value={time}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 160 }}
                    onChange={(e) => {
                      const next = [...apTimes];
                      next[i] = e.target.value;
                      setApTimes(next);
                    }}
                  />
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={updateTimesMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <AccessTimeIcon />}
                  disabled={!autopilot || updateTimesMutation.isPending}
                  sx={{ mt: 0.5, height: 40, alignSelf: "flex-end" }}
                  onClick={() =>
                    updateTimesMutation.mutate({
                      instagramAccountId: apAccountId || autopilot!.instagramAccountId,
                      niche: apNiche || autopilot!.niche,
                      postsPerDay: apPostsPerDay,
                      postingTimes: apTimes,
                      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    })
                  }
                >
                  {updateTimesMutation.isPending ? "Saving…" : "Update schedule"}
                </Button>
              </Stack>
            </Grid2>

            <Grid2 size={{ xs: 12 }}>
              <Stack direction="row" gap={1.5} flexWrap="wrap" alignItems="center">
                <Button
                  variant="contained"
                  disabled={!apNiche || !apAccountId || saveApMutation.isPending}
                  startIcon={saveApMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                  onClick={() =>
                    saveApMutation.mutate({
                      instagramAccountId: apAccountId,
                      niche: apNiche,
                      postsPerDay: apPostsPerDay,
                      postingTimes: apTimes,
                      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    })
                  }
                >
                  {saveApMutation.isPending ? "Saving…" : "Save autopilot"}
                </Button>
                <Tooltip title="Generate and schedule today's posts right now (don't wait for tomorrow's cron)">
                  <span>
                    <Button
                      variant="outlined"
                      startIcon={runApMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
                      disabled={!autopilot || runApMutation.isPending}
                      onClick={() => runApMutation.mutate(apTimes)}
                    >
                      {runApMutation.isPending ? `Generating ${apPostsPerDay} post${apPostsPerDay > 1 ? "s" : ""}…` : "Run now"}
                    </Button>
                  </span>
                </Tooltip>
                {autopilot && (
                  <Typography variant="body2" color="text.secondary">
                    {autopilot.totalGenerated} posts generated total
                    {autopilot.lastRunAt ? ` · last run ${format(new Date(autopilot.lastRunAt), "PPp")}` : ""}
                  </Typography>
                )}
              </Stack>
              {runApMutation.isPending && (
                <Alert severity="info" sx={{ mt: 1.5 }}>
                  Generating content and images for {apPostsPerDay} post{apPostsPerDay > 1 ? "s" : ""}… this takes 30–60 seconds per post.
                </Alert>
              )}
            </Grid2>
          </Grid2>
        )}
      </Paper>

      <Divider />

      {/* ── Manual Scheduler + Calendar Grid ── */}
      <Grid2 container spacing={2.5}>
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.5 }}>
            <Stack spacing={2.2}>
              <Typography variant="h5">Schedule post manually</Typography>
              <TextField select label="Instagram account" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                {accounts.length === 0 ? (
                  <MenuItem disabled>No connected accounts — go to Settings</MenuItem>
                ) : (
                  accounts.map((account) => (
                    <MenuItem key={account._id} value={account._id}>@{account.username}</MenuItem>
                  ))
                )}
              </TextField>
              <TextField select label="Post" value={postId} onChange={(e) => setPostId(e.target.value)}>
                {posts.length === 0 ? (
                  <MenuItem disabled>No posts in library yet</MenuItem>
                ) : (
                  posts.map((post) => <MenuItem key={post._id} value={post._id}>{post.title}</MenuItem>)
                )}
              </TextField>
              <TextField
                type="datetime-local"
                label="Date and time"
                InputLabelProps={{ shrink: true }}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <TextField
                select label="Frequency" value={frequency}
                onChange={(e) => setFrequency(e.target.value as typeof frequency)}
              >
                {(["once", "daily", "weekly", "monthly"] as const).map((item) => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                startIcon={scheduleMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <EventAvailableIcon />}
                disabled={!postId || !accountId || !scheduledAt || scheduleMutation.isPending}
                onClick={() =>
                  scheduleMutation.mutate({
                    postId,
                    instagramAccountId: accountId,
                    scheduledAt: new Date(scheduledAt).toISOString(),
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    frequency
                  })
                }
              >
                {scheduleMutation.isPending ? "Scheduling…" : "Add to calendar"}
              </Button>
            </Stack>
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
              <Typography variant="h5">Content calendar</Typography>
              <Stack direction="row" gap={0.5} flexWrap="wrap">
                {frequencies.map((freq) => (
                  <Chip
                    key={freq}
                    label={freq === "all" ? "All" : freq.charAt(0).toUpperCase() + freq.slice(1)}
                    color={filterFreq === freq ? "primary" : "default"}
                    onClick={() => setFilterFreq(freq)}
                    clickable
                  />
                ))}
              </Stack>
            </Stack>

            {isLoading ? (
              <Stack alignItems="center" py={4}><CircularProgress /></Stack>
            ) : filtered.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={4}>
                {schedules.length === 0 ? "No scheduled posts yet." : "No posts match this filter."}
              </Typography>
            ) : (
              <Grid2 container spacing={1.5}>
                {filtered.map((schedule) => (
                  <Grid2 key={schedule._id} size={{ xs: 12, sm: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: "transparent" }}>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                          <Typography fontWeight={800} sx={{ flex: 1 }}>
                            {schedule.postId?.title ?? "Post"}
                          </Typography>
                          <Chip size="small" color="primary" label={schedule.frequency} />
                        </Stack>
                        <Typography color="text.secondary" variant="body2">
                          {format(new Date(schedule.scheduledAt), "PPpp")}
                        </Typography>
                        <Chip
                          size="small"
                          label={schedule.status}
                          color={
                            schedule.status === "active" ? "success"
                              : schedule.status === "completed" ? "default"
                                : schedule.status === "failed" ? "error"
                                  : "warning"
                          }
                          sx={{ alignSelf: "flex-start" }}
                        />
                        <Stack direction="row" gap={1}>
                          <Button
                            size="small"
                            color="error"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(schedule._id)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid2>
                ))}
              </Grid2>
            )}
          </Paper>
        </Grid2>
      </Grid2>
    </Stack>
  );
}
