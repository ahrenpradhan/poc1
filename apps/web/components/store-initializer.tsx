"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useStore } from "@/store/useStore";
import { fetchUserWithPlan } from "@/graphql/helpers";

export function StoreInitializer() {
  const { data: session, status } = useSession();
  const { setUser, setProfile, setUserPlan, clearStore } = useStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    const loadUserData = async () => {
      if (session?.backendToken) {
        // Fetch latest user data from backend using 'me' query
        const userData = await fetchUserWithPlan(session.backendToken);

        if (userData) {
          // Set user data
          setUser({
            id: userData.id?.toString() || "",
            email: userData.email || "",
            first_name: userData.profile?.first_name || "",
            last_name: userData.profile?.last_name || "",
          });

          // Set profile data
          if (userData.profile) {
            setProfile({
              id: userData.profile.id,
              user_id: userData.profile.user_id,
              first_name: userData.profile.first_name,
              last_name: userData.profile.last_name,
              created_at: userData.profile.created_at,
              updated_at: userData.profile.updated_at,
              deleted_at: userData.profile.deleted_at || null,
            });
          }

          // Set user_plan data
          if (userData.user_plan) {
            setUserPlan({
              id: userData.user_plan.id,
              user_id: userData.user_plan.user_id,
              plan_id: userData.user_plan.plan_id,
              status: userData.user_plan.status,
              started_at: userData.user_plan.started_at,
              ends_at: userData.user_plan.ends_at || null,
              cancelled_at: userData.user_plan.cancelled_at || null,
              created_at: userData.user_plan.created_at,
              updated_at: userData.user_plan.updated_at,
              plan: userData.user_plan.plan
                ? {
                    id: userData.user_plan.plan.id,
                    title: userData.user_plan.plan.title,
                    description: userData.user_plan.plan.description || null,
                    price: userData.user_plan.plan.price,
                    currency: userData.user_plan.plan.currency,
                    interval: userData.user_plan.plan.interval,
                    is_active: userData.user_plan.plan.is_active,
                    created_at: userData.user_plan.plan.created_at,
                    updated_at: userData.user_plan.plan.updated_at,
                  }
                : null,
            });
          }

          setIsInitialized(true);
        }
      } else {
        // Clear store when user logs out
        clearStore();
        setIsInitialized(false);
      }
    };

    loadUserData();
  }, [session, status, setUser, setProfile, setUserPlan, clearStore]);

  return null;
}
