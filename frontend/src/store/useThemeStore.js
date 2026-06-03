import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "dark",
  toggleTheme: () => {
    const nextTheme = localStorage.getItem("chat-theme") === "light" ? "dark" : "light";
    localStorage.setItem("chat-theme", nextTheme);
    
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
    
    set({ theme: nextTheme });
  },
  initTheme: () => {
    const savedTheme = localStorage.getItem("chat-theme") || "dark";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
    }
    set({ theme: savedTheme });
  }
}));
