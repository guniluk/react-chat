import { create } from "zustand";

export interface UserType {
  _id: string;
  fullName: string;
  username: string;
  profilePic: string;
  gender: string;
}

export interface MessageType {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationState {
  selectedConversation: UserType | null;
  setSelectedConversation: (selectedConversation: UserType | null) => void;
  messages: MessageType[];
  setMessages: (messages: MessageType[]) => void;
  users: UserType[];
  setUsers: (users: UserType[]) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) => set({ selectedConversation }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  users: [],
  setUsers: (users) => set({ users }),
}));
