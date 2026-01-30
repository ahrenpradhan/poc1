"use client";

import { cn } from "@repo/ui/lib/utils";
import {
  MESSAGE_MAX_WIDTH_MOBILE,
  MESSAGE_MAX_WIDTH_DESKTOP,
} from "@/lib/constants";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  className?: string;
}

export function ChatMessage({
  role,
  content,
  created_at,
  className,
}: ChatMessageProps) {
  const isUser = role === "user";

  const formatTime = (timestamp: string) => {
    if (!timestamp) {
      return "";
    }

    const date = new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      // Today - show time
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      // Yesterday
      return `Yesterday ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (days < 7) {
      // This week - show day and time
      return date.toLocaleDateString([], {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      // Older - show date and time
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col",
        isUser ? "items-end" : "items-start",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-3 py-2 sm:px-4 sm:py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
        style={{
          maxWidth:
            typeof window !== "undefined" && window.innerWidth < 640
              ? MESSAGE_MAX_WIDTH_MOBILE
              : MESSAGE_MAX_WIDTH_DESKTOP,
        }}
      >
        <p className="whitespace-pre-wrap break-words text-sm sm:text-base">
          {content}
        </p>
      </div>
      <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 px-1">
        {formatTime(created_at)}
      </span>
    </div>
  );
}
