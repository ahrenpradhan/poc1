"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/primitives/button";
import { Search, Send } from "lucide-react";
import {
  CREATE_NEW_CHAT_BY_MESSAGE,
  CREATE_MESSAGE,
  GENERATE_AI_RESPONSE,
} from "@/graphql/queries";
import {
  REFOCUS_DELAY,
  INPUT_MAX_HEIGHT,
  INPUT_MAX_HEIGHT_MOBILE,
} from "@/lib/constants";
import { AdapterSelector, AdapterType } from "./adapter-selector";

interface Message {
  id: number;
  sequence: number;
  role: string;
  content: string;
  created_at: string;
}

interface ChatInputProps {
  mode: "create" | "reply";
  chatId?: number;
  onMessageSent?: (message: Message) => void;
  onAIResponseReceived?: (message: Message) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  className?: string;
}

export function ChatInput({
  mode,
  chatId,
  onMessageSent,
  onAIResponseReceived,
  onTypingStart,
  onTypingEnd,
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [adapter, setAdapter] = useState<AdapterType>("mock");
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
  const [generateAIResponse] = useMutation(GENERATE_AI_RESPONSE);

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
        // Store chat id for AI response generation after redirect
        const newChatId = data.createNewChatByMessage.id;
        router.push(
          `/chat/${data.createNewChatByMessage.public_id}?generateAI=${newChatId}&adapter=${adapter}`,
        );
      }
    } else if (mode === "reply" && chatId) {
      // Step 1: Create user message
      const { data } = await createMessage({
        variables: {
          input: {
            chat_id: chatId,
            role: "user",
            content: trimmedMessage,
          },
        },
      });

      if (data?.createMessage) {
        // Immediately show user message
        onMessageSent?.(data.createMessage);
        setMessage("");

        // Step 2: Start typing indicator
        onTypingStart?.();

        try {
          // Step 3: Generate AI response
          const { data: aiData } = await generateAIResponse({
            variables: {
              input: {
                chat_id: chatId,
                adapter: adapter,
              },
            },
          });

          if (aiData?.generateAIResponse) {
            onAIResponseReceived?.(aiData.generateAIResponse);
          }
        } finally {
          // Step 4: End typing indicator
          onTypingEnd?.();
        }
      }
    }

    // Refocus after sending - use setTimeout to ensure it happens after React re-render
    setTimeout(() => {
      textareaRef.current?.focus();
    }, REFOCUS_DELAY);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={className}>
      <div className="bg-muted rounded-2xl sm:rounded-3xl p-3 sm:p-6 space-y-3 sm:space-y-4">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent outline-none text-base sm:text-lg placeholder:text-muted-foreground resize-none min-h-[24px]"
          style={{
            maxHeight:
              typeof window !== "undefined" && window.innerWidth < 640
                ? INPUT_MAX_HEIGHT_MOBILE
                : INPUT_MAX_HEIGHT,
          }}
          placeholder="Ask anything"
          rows={1}
          disabled={isLoading}
        />
        <div className="flex justify-between items-center">
          <AdapterSelector
            value={adapter}
            onChange={setAdapter}
            disabled={isLoading}
          />
          <Button
            size="sm"
            className="rounded-full gap-2"
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
          >
            {mode === "create" ? (
              <>
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
