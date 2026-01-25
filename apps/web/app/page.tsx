"use client";

import { useSession } from "next-auth/react";
import { Sidebar, SidebarProvider } from "@repo/ui/primitives/sidebar";
import { Navbar } from "@/components/navbar";
import { Button } from "@repo/ui/primitives/button";
import { Search } from "lucide-react";

export default function Page() {
  const { data: session } = useSession();

  return (
    <SidebarProvider defaultOpen={false}>
      {session && <Sidebar />}
      <main className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-3xl space-y-8">
            <h1 className="text-4xl font-light text-center">
              This is Cortex, how can I help you?
            </h1>
            <div className="bg-muted rounded-3xl p-6 space-y-4">
              <input
                type="text"
                className="w-full bg-transparent outline-none text-lg placeholder:text-muted-foreground"
                placeholder="Ask anything"
              />
              <div className="flex justify-end">
                <Button size="sm" className="rounded-full gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>
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
