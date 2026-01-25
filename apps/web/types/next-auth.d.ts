import { DefaultSession } from "next-auth";
import { Profile, UserPlan } from "@/store/useStore";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      profile?: Profile;
      user_plan?: UserPlan;
    } & DefaultSession["user"];
    backendToken?: string;
  }

  interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    profile?: Profile;
    user_plan?: UserPlan;
    backendToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    profile?: Profile;
    user_plan?: UserPlan;
    backendToken?: string;
  }
}
