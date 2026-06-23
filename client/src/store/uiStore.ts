import { create } from "zustand";

interface UiState {
  mode: "light" | "dark";
  toast: string | null;
  toggleMode: () => void;
  notify: (message: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  mode: (localStorage.getItem("mode") as "light" | "dark") ?? "dark",
  toast: null,
  toggleMode: () =>
    set((state) => {
      const mode = state.mode === "dark" ? "light" : "dark";
      localStorage.setItem("mode", mode);
      return { mode };
    }),
  notify: (toast) => set({ toast })
}));
