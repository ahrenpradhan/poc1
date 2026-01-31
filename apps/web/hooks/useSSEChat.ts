"use client";

import { useCallback, useRef } from "react";
import { getSession } from "next-auth/react";

interface SSEMessage {
  id: number;
  chat_id: number;
  sequence: number;
  role: "assistant";
  content: string;
  adapter: string;
  created_at: string;
}

interface SSEStreamOptions {
  chatId: number;
  adapter: string;
  onChunk: (chunk: string, fullContent: string) => void;
  onComplete: (message: SSEMessage) => void;
  onError: (error: string) => void;
}

export function useSSEChat() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const streamResponse = useCallback(
    async ({
      chatId,
      adapter,
      onChunk,
      onComplete,
      onError,
    }: SSEStreamOptions) => {
      // Abort any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        // Get the backend token from NextAuth session
        const session = await getSession();
        const token = (session as { backendToken?: string })?.backendToken;

        if (!token) {
          onError("No authentication token found");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/chat/stream`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              chat_id: chatId,
              adapter,
            }),
            signal: abortControllerRef.current.signal,
          },
        );

        if (!response.ok) {
          const error = await response.json();
          onError(error.error || "Failed to start stream");
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          onError("No response body");
          return;
        }

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.error) {
                  onError(data.error);
                  return;
                }

                if (data.chunk) {
                  fullContent += data.chunk;
                  onChunk(data.chunk, fullContent);
                }

                if (data.done && data.message) {
                  onComplete(data.message);
                  return;
                }
              } catch (e) {
                // Ignore JSON parse errors for incomplete chunks
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // Stream was cancelled, ignore
          return;
        }
        onError(err instanceof Error ? err.message : "Stream failed");
      }
    },
    [],
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return { streamResponse, cancelStream };
}
