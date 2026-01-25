import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Profile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface StoreState {
  user: User | null;
  profile: Profile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  clearStore: () => void;
}

export const useStore = create<StoreState>()(
  devtools(
    (set) => ({
      user: null,
      profile: null,
      setUser: (user) => set({ user }, false, "setUser"),
      setProfile: (profile) => set({ profile }, false, "setProfile"),
      clearStore: () => set({ user: null, profile: null }, false, "clearStore"),
    }),
    {
      enabled: process.env.NODE_ENV === "development",
      name: "AppStore",
    },
  ),
);
