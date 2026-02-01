"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/primitives/button";
import { Search, Send, Square } from "lucide-react";
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
import { NetworkSelector, NetworkType } from "./network-selector";
import { useSSEChat } from "@/hooks/useSSEChat";

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
  onStreamingChunk?: (chunk: string, fullContent: string) => void;
  onTypingStart?: () => void;
  onTypingEnd?: () => void;
  className?: string;
}

export function ChatInput({
  mode,
  chatId,
  onMessageSent,
  onAIResponseReceived,
  onStreamingChunk,
  onTypingStart,
  onTypingEnd,
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [adapter, setAdapter] = useState<AdapterType>("mock");
  const [networkType, setNetworkType] = useState<NetworkType>("api");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { streamResponse, cancelStream } = useSSEChat();

  // Auto-focus the input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-resize textarea up to 4 rows
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate line height (approx 24px for text-base, 28px for text-lg)
    const lineHeight = window.innerWidth < 640 ? 24 : 28;
    const maxRows = 4;
    const maxHeight = lineHeight * maxRows;

    // Set height to scrollHeight but cap at maxHeight
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;

    // Enable overflow if content exceeds max height
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  // Adjust height when message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const [createNewChat, { loading: creatingChat }] = useMutation(
    CREATE_NEW_CHAT_BY_MESSAGE,
  );
  const [createMessage, { loading: sendingMessage }] =
    useMutation(CREATE_MESSAGE);
  const [generateAIResponse] = useMutation(GENERATE_AI_RESPONSE);

  const isLoading = creatingChat || sendingMessage;

  const handleAPIResponse = async (chatId: number) => {
    abortControllerRef.current = new AbortController();

    const { data: aiData } = await generateAIResponse({
      variables: {
        input: {
          chat_id: chatId,
          adapter: adapter,
        },
      },
      context: {
        fetchOptions: {
          signal: abortControllerRef.current.signal,
        },
      },
    });

    if (aiData?.generateAIResponse) {
      onAIResponseReceived?.(aiData.generateAIResponse);
    }
  };

  const handleStop = () => {
    // Cancel SSE stream
    cancelStream();

    // Cancel API request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsGenerating(false);
    onTypingEnd?.();
  };

  const handleSSEResponse = async (chatId: number) => {
    await streamResponse({
      chatId,
      adapter,
      onChunk: (chunk, fullContent) => {
        onStreamingChunk?.(chunk, fullContent);
      },
      onComplete: (message) => {
        onAIResponseReceived?.(message as Message);
      },
      onError: (error) => {
        console.error("SSE Error:", error);
      },
    });
  };

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
        const newChatId = data.createNewChatByMessage.id;
        router.push(
          `/chat/${data.createNewChatByMessage.public_id}?generateAI=${newChatId}&adapter=${adapter}&network=${networkType}`,
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
        setIsGenerating(true);

        try {
          // Step 3: Generate AI response based on network type
          if (networkType === "sse") {
            await handleSSEResponse(chatId);
          } else {
            await handleAPIResponse(chatId);
          }
        } finally {
          // Step 4: End typing indicator
          setIsGenerating(false);
          onTypingEnd?.();
        }
      }
    }

    // Refocus after sending
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
          className="w-full bg-transparent outline-none text-base sm:text-lg placeholder:text-muted-foreground resize-none min-h-[24px] overflow-hidden"
          placeholder="Ask anything"
          rows={1}
          disabled={isLoading}
        />
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AdapterSelector
              value={adapter}
              onChange={setAdapter}
              disabled={isLoading}
            />
            <NetworkSelector
              value={networkType}
              onChange={setNetworkType}
              disabled={isLoading}
            />
          </div>
          {isGenerating ? (
            <Button
              size="sm"
              variant="destructive"
              className="rounded-full gap-2"
              onClick={handleStop}
            >
              <Square className="h-4 w-4 fill-current" />
              <span className="hidden sm:inline">Stop</span>
            </Button>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
