"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useStore } from "@/store/useStore";

export function StoreInitializer() {
  const { data: session, status } = useSession();
  const { setUser, setProfile, clearStore } = useStore();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      // Set user data from NextAuth session
      setUser({
        id: session.user.id || "",
        email: session.user.email || "",
        first_name: session.user.first_name || "",
        last_name: session.user.last_name || "",
      });

      // Set profile data from NextAuth session if available
      if (session.user.profile) {
        setProfile(session.user.profile);
      }
    } else {
      // Clear store when user logs out
      clearStore();
    }
  }, [session, status, setUser, setProfile, clearStore]);

  return null;
}
