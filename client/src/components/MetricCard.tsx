import { Box, Paper, Skeleton, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function MetricCard({ label, value, icon, loading }: { label: string; value?: string | number; icon: ReactNode; loading?: boolean }) {
  return (
    <Paper sx={{ p: 2.5, minHeight: 132 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography color="text.secondary" variant="body2">
            {label}
          </Typography>
          {loading ? <Skeleton width={80} height={44} /> : <Typography variant="h4">{value}</Typography>}
        </Box>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: "primary.main", color: "primary.contrastText", display: "grid" }}>{icon}</Box>
      </Stack>
    </Paper>
  );
}
