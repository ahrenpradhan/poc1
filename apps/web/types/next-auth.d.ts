import { DefaultSession } from "next-auth";
import { Profile } from "@/store/useStore";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      profile?: Profile;
    } & DefaultSession["user"];
    backendToken?: string;
  }

  interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    profile?: Profile;
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
    backendToken?: string;
  }
}
