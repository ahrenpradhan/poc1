"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Navbar } from "@/components/navbar";
import { Loading } from "@/components/loading";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatSidebar } from "@/components/chat-sidebar";
import { GET_CHAT_BY_PUBLIC_ID, GENERATE_AI_RESPONSE } from "@/graphql/queries";
import { useSSEChat } from "@/hooks/useSSEChat";

interface Message {
  id: number;
  chat_id: number;
  sequence: number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const [newMessages, setNewMessages] = useState<Message[]>([]);
  const [isAITyping, setIsAITyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const { streamResponse } = useSSEChat();
  const generatingRef = useRef(false);

  const publicId = params.publicId as string;
  const generateAIChatId = searchParams.get("generateAI");
  const adapterParam = searchParams.get("adapter");
  const networkParam = searchParams.get("network");

  const { data, loading } = useQuery(GET_CHAT_BY_PUBLIC_ID, {
    variables: { public_id: publicId },
    skip: !publicId || sessionStatus !== "authenticated",
  });

  const [generateAIResponse] = useMutation(GENERATE_AI_RESPONSE);

  const chat = data?.chatByPublicId;

  // Redirect to main page if chat not found or user not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (!loading && !chat && sessionStatus === "authenticated") {
      router.replace("/");
    }
  }, [chat, loading, router, sessionStatus]);

  // Handle AI response generation for new chats
  useEffect(() => {
    if (generateAIChatId && chat && !generatingRef.current) {
      const chatId = parseInt(generateAIChatId, 10);
      if (chatId === chat.id) {
        generatingRef.current = true;

        // Clear the URL parameter
        router.replace(`/chat/${publicId}`, { scroll: false });

        // Generate AI response
        const generateResponse = async () => {
          setIsAITyping(true);

          try {
            if (networkParam === "sse") {
              // Use SSE streaming
              await streamResponse({
                chatId,
                adapter: adapterParam || "mock",
                onChunk: (_chunk, fullContent) => {
                  setStreamingContent(fullContent);
                },
                onComplete: (message) => {
                  setStreamingContent("");
                  setNewMessages((prev) => [...prev, message as Message]);
                  generatingRef.current = false;
                },
                onError: (error) => {
                  console.error("SSE Error:", error);
                  generatingRef.current = false;
                },
              });
            } else {
              // Use regular API
              const { data: aiData } = await generateAIResponse({
                variables: {
                  input: {
                    chat_id: chatId,
                    adapter: adapterParam || "mock",
                  },
                },
              });

              if (aiData?.generateAIResponse) {
                setNewMessages((prev) => [...prev, aiData.generateAIResponse]);
              }
              generatingRef.current = false;
            }
          } finally {
            setIsAITyping(false);
          }
        };

        generateResponse();
      }
    }
  }, [
    generateAIChatId,
    chat,
    publicId,
    router,
    generateAIResponse,
    adapterParam,
    networkParam,
    streamResponse,
  ]);

  const handleMessageSent = (message: Message) => {
    setNewMessages((prev) => [...prev, message]);
  };

  const handleAIResponseReceived = (message: Message) => {
    setStreamingContent("");
    setNewMessages((prev) => [...prev, message]);
  };

  const handleStreamingChunk = (_chunk: string, fullContent: string) => {
    setStreamingContent(fullContent);
  };

  const handleTypingStart = () => {
    setIsAITyping(true);
  };

  const handleTypingEnd = () => {
    setIsAITyping(false);
  };

  // Show loading while session or chat is loading
  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex h-screen">
        <main className="flex-1 flex flex-col">
          <Navbar />
          <Loading />
        </main>
      </div>
    );
  }

  // Don't render if redirecting
  if (!chat || sessionStatus !== "authenticated") {
    return null;
  }

  return (
    <div className="flex h-screen">
      {session && <ChatSidebar />}
      <main className="flex-1 flex flex-col min-w-0">
        <Navbar />

        {/* Message list - takes remaining space */}
        <ChatMessageList
          chatId={chat.id}
          newMessages={newMessages}
          isAITyping={isAITyping}
          streamingContent={streamingContent}
        />

        {/* Fixed input at bottom */}
        <div className="border-t bg-background p-2 sm:p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              mode="reply"
              chatId={chat.id}
              onMessageSent={handleMessageSent}
              onAIResponseReceived={handleAIResponseReceived}
              onStreamingChunk={handleStreamingChunk}
              onTypingStart={handleTypingStart}
              onTypingEnd={handleTypingEnd}
            />
          </div>
        </div>

        {/* Footer - hidden on mobile */}
        <footer className="hidden sm:block text-center text-xs text-muted-foreground py-2 border-t">
          By messaging Cortex, an AI chatbot, you agree to our{" "}
          <a href="#" className="underline">
            Terms
          </a>{" "}
          and have read our{" "}
          <a href="#" className="underline">
            Privacy Policy
          </a>
          .
        </footer>
      </main>
    </div>
  );
}
