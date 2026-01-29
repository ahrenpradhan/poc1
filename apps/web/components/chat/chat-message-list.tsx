"use client";

import { useRef, useEffect, useCallback } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CHAT_MESSAGES_PAGINATED } from "@/graphql/queries";
import { ChatMessage } from "./chat-message";
import { Loading } from "@/components/loading";

interface Message {
  id: number;
  chat_id: number;
  sequence: number;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

interface ChatMessageListProps {
  chatId: number;
  newMessages?: Message[];
}

const PAGE_SIZE = 20;

export function ChatMessageList({
  chatId,
  newMessages = [],
}: ChatMessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const previousScrollHeight = useRef<number>(0);

  const { data, loading, fetchMore } = useQuery(GET_CHAT_MESSAGES_PAGINATED, {
    variables: {
      chat_id: chatId,
      last: PAGE_SIZE,
    },
    notifyOnNetworkStatusChange: true,
  });

  const messages =
    data?.chatMessagesPaginated?.edges?.map(
      (edge: { node: Message }) => edge.node,
    ) || [];
  const pageInfo = data?.chatMessagesPaginated?.pageInfo;

  // Combine server messages with optimistically added new messages
  const allMessages = [
    ...messages,
    ...newMessages.filter(
      (nm) => !messages.some((m: Message) => m.id === nm.id),
    ),
  ];

  // Scroll to bottom on initial load and when new messages are added
  useEffect(() => {
    if (
      bottomRef.current &&
      (isInitialLoad.current || newMessages.length > 0)
    ) {
      bottomRef.current.scrollIntoView({
        behavior: isInitialLoad.current ? "auto" : "smooth",
      });
      isInitialLoad.current = false;
    }
  }, [allMessages.length, newMessages.length]);

  // Load more messages when scrolling to top
  const loadOlderMessages = useCallback(() => {
    if (!pageInfo?.hasPreviousPage || loading) return;

    const container = scrollContainerRef.current;
    if (container) {
      previousScrollHeight.current = container.scrollHeight;
    }

    fetchMore({
      variables: {
        chat_id: chatId,
        last: PAGE_SIZE,
        before: pageInfo.startCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        const newEdges = fetchMoreResult.chatMessagesPaginated.edges;
        const existingEdges = prev.chatMessagesPaginated.edges;

        return {
          chatMessagesPaginated: {
            ...fetchMoreResult.chatMessagesPaginated,
            edges: [...newEdges, ...existingEdges],
            pageInfo: {
              ...prev.chatMessagesPaginated.pageInfo,
              hasPreviousPage:
                fetchMoreResult.chatMessagesPaginated.pageInfo.hasPreviousPage,
              startCursor:
                fetchMoreResult.chatMessagesPaginated.pageInfo.startCursor,
            },
          },
        };
      },
    }).then(() => {
      // Maintain scroll position after loading older messages
      const container = scrollContainerRef.current;
      if (container && previousScrollHeight.current) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - previousScrollHeight.current;
      }
    });
  }, [chatId, fetchMore, loading, pageInfo]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadOlderMessages();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadOlderMessages]);

  if (loading && messages.length === 0) {
    return <Loading />;
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {/* Sentinel for loading older messages */}
      <div ref={topSentinelRef} className="h-1" />

      {loading && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}

      {allMessages.map((message: Message) => (
        <ChatMessage
          key={message.id}
          role={message.role}
          content={message.content}
        />
      ))}

      {/* Bottom anchor for scrolling to latest */}
      <div ref={bottomRef} />
    </div>
  );
}
