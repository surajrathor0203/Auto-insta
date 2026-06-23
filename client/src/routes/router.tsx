import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { CalendarPage } from "../pages/CalendarPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { LibraryPage } from "../pages/LibraryPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { SettingsPage } from "../pages/SettingsPage";
import { StudioPage } from "../pages/StudioPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/studio", element: <StudioPage /> },
      { path: "/library", element: <LibraryPage /> },
      { path: "/calendar", element: <CalendarPage /> },
      { path: "/analytics", element: <AnalyticsPage /> },
      { path: "/settings", element: <SettingsPage /> }
    ]
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> }
    ]
  }
]);
