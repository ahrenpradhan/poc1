"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client/react";
import { Navbar } from "@/components/navbar";
import { Loading } from "@/components/loading";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatSidebar } from "@/components/chat-sidebar";
import { GET_CHAT_BY_PUBLIC_ID } from "@/graphql/queries";

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
  const { data: session, status: sessionStatus } = useSession();
  const [newMessages, setNewMessages] = useState<Message[]>([]);

  const publicId = params.publicId as string;

  const { data, loading, error } = useQuery(GET_CHAT_BY_PUBLIC_ID, {
    variables: { public_id: publicId },
    skip: !publicId || sessionStatus !== "authenticated",
  });

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

  const handleMessageSent = (message: Message) => {
    setNewMessages((prev) => [...prev, message]);
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
      <main className="flex-1 flex flex-col">
        <Navbar />

        {/* Message list - takes remaining space */}
        <ChatMessageList chatId={chat.id} newMessages={newMessages} />

        {/* Fixed input at bottom */}
        <div className="border-t bg-background p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              mode="reply"
              chatId={chat.id}
              onMessageSent={handleMessageSent}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-2 border-t">
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
