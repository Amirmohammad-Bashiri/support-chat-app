import { create } from "zustand";

import type { User } from "@/types";

interface UserStore {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsError: (isError: boolean) => void;
}

export const useUserStore = create<UserStore>(set => ({
  user: null,
  isLoading: false,
  isError: false,
  setUser: user => set({ user }),
  setIsLoading: isLoading => set({ isLoading }),
  setIsError: isError => set({ isError }),
}));
