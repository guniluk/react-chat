import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

export interface UserType {
  _id: string;
  fullName: string;
  username: string;
  profilePic: string;
  gender: string;
}

interface AuthState {
  authUser: UserType | null;
  token: string | null;
  onlineUsers: string[];
  socket: any;
  setAuthUser: (user: UserType | null, token: string | null) => void;
  setOnlineUsers: (users: string[]) => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      authUser: null,
      token: null,
      onlineUsers: [],
      socket: null,

      setAuthUser: (user, token) => {
        set({ authUser: user, token: token || null });
      },

      setOnlineUsers: (users) => set({ onlineUsers: users }),

      connectSocket: () => {
        const { authUser, socket } = get();
        if (!authUser || socket) return;

        const newSocket = io(SOCKET_URL, {
          query: {
            userId: authUser._id,
          },
          transports: ['websocket'],
        });

        set({ socket: newSocket });

        newSocket.on('getOnlineUsers', (users: string[]) => {
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

      logout: async () => {
        const { disconnectSocket } = get();
        disconnectSocket();
        set({ authUser: null, token: null, onlineUsers: [] });
      },
    }),
    {
      name: 'chat-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ authUser: state.authUser, token: state.token }),
    },
  ),
);
