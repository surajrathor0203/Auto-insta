import { createTheme } from "@mui/material/styles";

export const buildTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#4f46e5" },
      secondary: { main: "#06b6d4" },
      success: { main: "#16a34a" },
      error: { main: "#dc2626" },
      background: {
        default: mode === "dark" ? "#09090b" : "#f7f8fb",
        paper: mode === "dark" ? "rgba(24,24,27,0.78)" : "rgba(255,255,255,0.82)"
      }
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: ["Inter", "ui-sans-serif", "system-ui", "Arial"].join(","),
      h4: { fontWeight: 750 },
      h6: { fontWeight: 720 },
      button: { textTransform: "none", fontWeight: 700 }
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backdropFilter: "blur(18px)",
            border: mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(15,23,42,0.08)"
          }
        }
      },
      MuiButton: { defaultProps: { disableElevation: true } }
    }
  });
