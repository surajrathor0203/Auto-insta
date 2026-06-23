import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, Snackbar, ThemeProvider } from "@mui/material";
import { RouterProvider } from "react-router-dom";
import { buildTheme } from "./theme/theme";
import { router } from "./routes/router";
import { useUiStore } from "./store/uiStore";
import "./styles.css";

const queryClient = new QueryClient();

function AppProviders() {
  const { mode, toast, notify } = useUiStore();
  return (
    <React.StrictMode>
      <ThemeProvider theme={buildTheme(mode)}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Snackbar open={Boolean(toast)} autoHideDuration={3200} onClose={() => notify(null)} message={toast} />
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<AppProviders />);
