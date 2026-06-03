import { create } from "zustand";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: JSON.parse(localStorage.getItem("chat-user")) || null,
  onlineUsers: [], // list of online user IDs
  socket: null,
  setAuthUser: (user) => {
    if (user) {
      localStorage.setItem("chat-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("chat-user");
    }
    set({ authUser: user });
  },
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket) return;

    const newSocket = io(SOCKET_URL, {
      query: {
        userId: authUser._id,
      },
    });
    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });
  },
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null });
    }
  },
}));
