import { http } from "./http";
import type { AuthResponse } from "../types";

export const authApi = {
  register: (body: { name: string; email: string; password: string }) => http.post<AuthResponse>("/api/auth/register", body).then((r) => r.data),
  login: (body: { email: string; password: string }) => http.post<AuthResponse>("/api/auth/login", body).then((r) => r.data),
  forgotPassword: (email: string) => http.post("/api/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) => http.post("/api/auth/reset-password", { token, password })
};
