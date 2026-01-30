"use client";

import { useQuery } from "@apollo/client/react";
import { GET_USER_CHATS } from "@/graphql/queries";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Plus, X } from "lucide-react";
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
  const { isOpen, isMobile, setIsOpen } = useSidebarState();
  const { data, loading } = useQuery(GET_USER_CHATS, {
    fetchPolicy: "cache-and-network",
  });

  const chats: Chat[] = data?.chatsByOwnerId || [];

  // Close sidebar when navigating on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const sidebarContent = (
    <div
      className={cn(
        "flex flex-col h-full bg-background flex-shrink-0",
        // Mobile: full width with max, Desktop: fixed width
        isMobile ? "w-full max-w-[280px]" : "w-64 border-r",
      )}
    >
      {/* Header with close button on mobile */}
      <div className="p-4 border-b flex items-center justify-between gap-2">
        <Link href="/" className="flex-1" onClick={handleLinkClick}>
          <Button className="w-full gap-2" variant="outline">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </Link>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
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
                onClick={handleLinkClick}
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

  // Mobile: render as overlay drawer
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
        {/* Drawer */}
        <div className="fixed inset-y-0 left-0 z-50 shadow-xl">
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop: render inline
  return sidebarContent;
}
