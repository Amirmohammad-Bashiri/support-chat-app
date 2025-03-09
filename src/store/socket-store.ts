import { create } from "zustand";
import { Socket } from "socket.io-client";

export interface Message {
  id: string;
  text: string;
  senderId: number;
  timestamp: Date;
}

export interface Room {
  id: string;
  userId: string;
  agentId: string | null;
  messages: Message[];
  isActive: boolean;
}

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  isAgent: boolean;
  rooms: Room[];
  currentRoom: string | null;
  setSocket: (socket: Socket | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  setIsAgent: (isAgent: boolean) => void;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  setCurrentRoom: (roomId: string | null) => void;
  addMessage: (roomId: string, message: Message) => void;
  removeRoom: (roomId: string) => void;
}

export const useSocketStore = create<SocketStore>(set => ({
  socket: null,
  isConnected: false,
  isAgent: false,
  rooms: [],
  currentRoom: null,
  setSocket: socket => set({ socket }),
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
  addMessage: (roomId, message) =>
    set(state => ({
      rooms: state.rooms.map(room =>
        room.id === roomId
          ? { ...room, messages: [...room.messages, message] }
          : room
      ),
    })),
  removeRoom: roomId =>
    set(state => ({
      rooms: state.rooms.filter(room => room.id !== roomId),
      currentRoom: state.currentRoom === roomId ? null : state.currentRoom,
    })),
}));
