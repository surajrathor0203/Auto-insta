import { Outlet, NavLink, Navigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";

const navItems = [
  { to: "/", label: "Dashboard", icon: <DashboardIcon /> },
  { to: "/studio", label: "AI Studio", icon: <AutoAwesomeIcon /> },
  { to: "/library", label: "Library", icon: <CollectionsBookmarkIcon /> },
  { to: "/calendar", label: "Calendar", icon: <CalendarMonthIcon /> },
  { to: "/analytics", label: "Analytics", icon: <BarChartIcon /> },
  { to: "/settings", label: "Settings", icon: <SettingsIcon /> }
];

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const { mode, toggleMode } = useUiStore();
  const compact = useMediaQuery("(max-width:760px)");

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Box sx={{ minHeight: "100vh", background: mode === "dark" ? "radial-gradient(circle at top left, rgba(79,70,229,.22), transparent 30%), #09090b" : "#f7f8fb" }}>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: "blur(18px)", borderBottom: "1px solid", borderColor: "divider" }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: compact ? 1 : 0 }}>
            Auto Publisher
          </Typography>
          <Stack direction="row" gap={0.5} sx={{ flexGrow: 1, overflowX: "auto" }}>
            {navItems.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                startIcon={compact ? undefined : item.icon}
                sx={{ color: "text.primary", minWidth: compact ? 44 : undefined, "&.active": { bgcolor: "action.selected" } }}
              >
                {compact ? item.icon : item.label}
              </Button>
            ))}
          </Stack>
          <Tooltip title="Toggle theme">
            <IconButton onClick={toggleMode}>{mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}</IconButton>
          </Tooltip>
          <Tooltip title="Logout">
            <IconButton onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
