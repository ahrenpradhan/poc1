"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/primitives/button";
import { Search, Send } from "lucide-react";
import { CREATE_NEW_CHAT_BY_MESSAGE, CREATE_MESSAGE } from "@/graphql/queries";

interface ChatInputProps {
  mode: "create" | "reply";
  chatId?: number;
  onMessageSent?: (message: {
    id: number;
    sequence: number;
    role: string;
    content: string;
    created_at: string;
  }) => void;
  className?: string;
}

export function ChatInput({
  mode,
  chatId,
  onMessageSent,
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus the input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const [createNewChat, { loading: creatingChat }] = useMutation(
    CREATE_NEW_CHAT_BY_MESSAGE,
  );
  const [createMessage, { loading: sendingMessage }] =
    useMutation(CREATE_MESSAGE);

  const isLoading = creatingChat || sendingMessage;

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    if (mode === "create") {
      const { data } = await createNewChat({
        variables: {
          input: {
            role: "user",
            content: trimmedMessage,
          },
        },
      });

      if (data?.createNewChatByMessage?.public_id) {
        router.push(`/chat/${data.createNewChatByMessage.public_id}`);
      }
    } else if (mode === "reply" && chatId) {
      const { data } = await createMessage({
        variables: {
          input: {
            chat_id: chatId,
            role: "user",
            content: trimmedMessage,
          },
        },
      });

      if (data?.createMessage && onMessageSent) {
        onMessageSent(data.createMessage);
      }
      setMessage("");
    }

    // Refocus after sending - use setTimeout to ensure it happens after React re-render
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={className}>
      <div className="bg-muted rounded-3xl p-6 space-y-4">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent outline-none text-lg placeholder:text-muted-foreground resize-none min-h-[24px] max-h-[200px]"
          placeholder="Ask anything"
          rows={1}
          disabled={isLoading}
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            className="rounded-full gap-2"
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
          >
            {mode === "create" ? (
              <>
                <Search className="h-4 w-4" />
                Search
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
