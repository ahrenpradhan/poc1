"use client";

import { cn } from "@repo/ui/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex w-full flex-col items-start", className)}>
      <div className="bg-muted text-foreground rounded-2xl px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground mr-2">AI is thinking</span>
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
