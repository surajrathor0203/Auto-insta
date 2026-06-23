import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (session: { user: User; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
}

const stored = localStorage.getItem("ai-instagram-session");

export const useAuthStore = create<AuthState>((set) => ({
  user: stored ? JSON.parse(stored).user : null,
  accessToken: stored ? JSON.parse(stored).accessToken : null,
  refreshToken: stored ? JSON.parse(stored).refreshToken : null,
  setSession: (session) => {
    localStorage.setItem("ai-instagram-session", JSON.stringify(session));
    set(session);
  },
  logout: () => {
    localStorage.removeItem("ai-instagram-session");
    set({ user: null, accessToken: null, refreshToken: null });
  }
}));
