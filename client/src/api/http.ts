import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
            { refreshToken }
          );
          useAuthStore.getState().setSession(data);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return http(original);
        } catch {
          useAuthStore.getState().logout();
          window.location.href = "/login";
        }
      } else {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
