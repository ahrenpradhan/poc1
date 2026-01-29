"use client";

import { useSession } from "next-auth/react";
import { Sidebar, SidebarProvider } from "@repo/ui/primitives/sidebar";
import { Navbar } from "@/components/navbar";
import { useStore } from "@/store/useStore";
import { Loading } from "@/components/loading";
import { ChatInput } from "@/components/chat/chat-input";

export default function Page() {
  const { data: session, status } = useSession();
  const { user } = useStore();

  // Gracefully handle loading and unauthenticated states
  const FULL_NAME = user
    ? [user.first_name, user.last_name].filter((_) => _).join(" ")
    : "";

  // Show loading animation while session is loading
  if (status === "loading") {
    return (
      <SidebarProvider defaultOpen={false}>
        <main className="flex-1 flex flex-col">
          <Navbar />
          <Loading />
        </main>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      {session && <Sidebar />}
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-3xl space-y-8">
            <h1 className="text-4xl font-light text-center">
              {FULL_NAME ? `Hi ${FULL_NAME}` : "This is Cortex"}, how can I help
              you?
            </h1>
            <ChatInput mode="create" />
          </div>
        </div>
        <footer className="text-center text-sm text-muted-foreground pb-4">
          By messaging Cortex, an AI chatbot, you agree to our{" "}
          <a href="#" className="underline">
            Terms
          </a>{" "}
          and have read our{" "}
          <a href="#" className="underline">
            Privacy Policy
          </a>
          . See{" "}
          <a href="#" className="underline">
            Cookie Preferences
          </a>
          .
        </footer>
      </main>
    </SidebarProvider>
  );
}
