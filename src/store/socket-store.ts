import { create } from "zustand";
import type { Socket } from "socket.io-client";

export interface Message {
  id: number;
  text: string;
  support_chat_set: number;
  is_edited: boolean;
  created_at: string;
  created_by: number;
  message_type: number;
  is_deleted: boolean;
}

export interface Room {
  id: number;
  name: string;
  subject: string;
  description?: string;
  agent: number;
  client: number;
  is_active: boolean;
  agent_joined_at: string | null;
  closed_by: number | null;
  created_at: string;
  closed_at: string | null;
  expire_date: string;
}

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  isAgent: boolean;
  rooms: Room[];
  currentRoom: number | null; // Change type to match Room.id
  setSocket: (socket: Socket | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  setIsAgent: (isAgent: boolean) => void;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: number, updates: Partial<Room>) => void; // Update type
  setCurrentRoom: (roomId: number | null) => void; // Update type
  addMessage: (roomId: number, message: Message) => void; // Update to handle messages separately
  removeRoom: (roomId: number) => void; // Update type
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  isAgent: false,
  rooms: [],
  currentRoom: null,
  setSocket: socket => {
    const currentSocket = get().socket;
    if (currentSocket === socket) return;

    set({ socket });
  },
  setIsConnected: isConnected => set({ isConnected }),
  setIsAgent: isAgent => set({ isAgent }),
  setRooms: rooms => set({ rooms }),
  addRoom: room => set(state => ({ rooms: [...state.rooms, room] })),
  updateRoom: (roomId, updates) =>
    set(state => ({
      rooms: state.rooms.map(room =>
        room.id === roomId ? { ...room, ...updates } : room
      ),
    })),
  setCurrentRoom: roomId => set({ currentRoom: roomId }),
  addMessage: (roomId, message) => {
    console.log(`Message added to room ${roomId}:`, message);
  },
  removeRoom: roomId =>
    set(state => ({
      rooms: state.rooms.filter(room => room.id !== roomId),
      currentRoom: state.currentRoom === roomId ? null : state.currentRoom,
    })),
}));
