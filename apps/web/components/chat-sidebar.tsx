"use client";

import { useQuery } from "@apollo/client/react";
import { GET_USER_CHATS } from "@/graphql/queries";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Plus } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { useSidebarState } from "@/lib/sidebar-context";
import { Button } from "@repo/ui/primitives/button";

interface Chat {
  id: number;
  public_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function ChatSidebar() {
  const pathname = usePathname();
  const { isOpen } = useSidebarState();
  const { data, loading } = useQuery(GET_USER_CHATS, {
    fetchPolicy: "cache-and-network",
  });

  const chats: Chat[] = data?.chatsByOwnerId || [];

  if (!isOpen) {
    return null;
  }

  return (
    <div className="flex flex-col h-full w-64 border-r bg-background flex-shrink-0">
      <div className="p-4 border-b">
        <Link href="/">
          <Button className="w-full gap-2" variant="outline">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </Link>
      </div>

      <div className="px-4 py-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Chats</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading && chats.length === 0 && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        )}

        {!loading && chats.length === 0 && (
          <div className="text-center text-muted-foreground text-sm p-4">
            No chats yet. Start a conversation!
          </div>
        )}

        <div className="space-y-1">
          {chats.map((chat) => {
            const isActive = pathname === `/chat/${chat.public_id}`;
            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.public_id}`}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors",
                  isActive && "bg-muted",
                )}
              >
                <MessageSquare className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {chat.title || "Untitled Chat"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(chat.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
