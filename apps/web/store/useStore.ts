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

export interface Plan {
  id: number;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPlan {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  started_at: string;
  ends_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  plan: Plan | null;
}

interface StoreState {
  user: User | null;
  profile: Profile | null;
  userPlan: UserPlan | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setUserPlan: (userPlan: UserPlan | null) => void;
  clearStore: () => void;
}

export const useStore = create<StoreState>()(
  devtools(
    (set) => ({
      user: null,
      profile: null,
      userPlan: null,
      setUser: (user) => set({ user }, false, "setUser"),
      setProfile: (profile) => set({ profile }, false, "setProfile"),
      setUserPlan: (userPlan) => set({ userPlan }, false, "setUserPlan"),
      clearStore: () =>
        set({ user: null, profile: null, userPlan: null }, false, "clearStore"),
    }),
    {
      enabled: process.env.NODE_ENV === "development",
      name: "AppStore",
    },
  ),
);
