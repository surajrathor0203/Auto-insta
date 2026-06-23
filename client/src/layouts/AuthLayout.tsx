import { Box, Paper, Stack, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        background: "linear-gradient(135deg, #09090b 0%, #111827 46%, #172554 100%)"
      }}
    >
      <Stack spacing={3} sx={{ width: "100%", maxWidth: 460 }}>
        <Box>
          <Typography variant="h4" color="white">
            AI Instagram Auto Publisher
          </Typography>
          <Typography color="rgba(255,255,255,.7)">Plan, generate, schedule, and publish from one polished workspace.</Typography>
        </Box>
        <Paper sx={{ p: 3 }}>
          <Outlet />
        </Paper>
      </Stack>
    </Box>
  );
}
