"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_CHAT_MESSAGES_BY_USER_COUNT } from "@/graphql/queries";
import { GetChatMessagesByUserCountResponse, Message } from "@/graphql/types";
import { ChatMessage } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";
import { Loading } from "@/components/loading";
import {
  USER_MESSAGE_PAGE_SIZE,
  VIEWPORT_FILL_DELAY,
  VIEWPORT_FILL_INTERVAL,
  INTERSECTION_THRESHOLD,
} from "@/lib/constants";

interface ChatMessageListProps {
  chatId: number;
  newMessages?: Message[];
  isAITyping?: boolean;
  streamingContent?: string;
}

export function ChatMessageList({
  chatId,
  newMessages = [],
  isAITyping = false,
  streamingContent,
}: ChatMessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const previousScrollHeight = useRef<number>(0);
  const [isFillingViewport, setIsFillingViewport] = useState(false);

  const { data, loading, fetchMore } =
    useQuery<GetChatMessagesByUserCountResponse>(
      GET_CHAT_MESSAGES_BY_USER_COUNT,
      {
        variables: {
          chat_id: chatId,
          userMessageCount: USER_MESSAGE_PAGE_SIZE,
        },
        notifyOnNetworkStatusChange: true,
      },
    );

  const messages =
    data?.chatMessagesByUserCount?.edges?.map(
      (edge: { node: Message }) => edge.node,
    ) || [];
  const pageInfo = data?.chatMessagesByUserCount?.pageInfo;

  // Combine server messages with optimistically added new messages
  const allMessages = [
    ...messages,
    ...newMessages.filter(
      (nm) => !messages.some((m: Message) => m.id === nm.id),
    ),
  ];

  // Decode cursor to get sequence number
  const decodeCursor = (cursor: string) => {
    return parseInt(Buffer.from(cursor, "base64").toString("utf-8"), 10);
  };

  // Load more messages
  const loadOlderMessages = useCallback(async () => {
    if (!pageInfo?.hasPreviousPage || loading || isFillingViewport)
      return false;

    const container = scrollContainerRef.current;
    if (container) {
      previousScrollHeight.current = container.scrollHeight;
    }

    // Get the beforeSequence from startCursor
    const beforeSequence = pageInfo.startCursor
      ? decodeCursor(pageInfo.startCursor)
      : undefined;

    const result = await fetchMore({
      variables: {
        chat_id: chatId,
        userMessageCount: USER_MESSAGE_PAGE_SIZE,
        beforeSequence,
      },
      updateQuery: (
        prev: GetChatMessagesByUserCountResponse,
        {
          fetchMoreResult,
        }: { fetchMoreResult?: GetChatMessagesByUserCountResponse },
      ) => {
        if (!fetchMoreResult) return prev;

        const newEdges = fetchMoreResult.chatMessagesByUserCount.edges;
        const existingEdges = prev.chatMessagesByUserCount.edges;

        return {
          chatMessagesByUserCount: {
            ...fetchMoreResult.chatMessagesByUserCount,
            edges: [...newEdges, ...existingEdges],
            pageInfo: {
              ...prev.chatMessagesByUserCount.pageInfo,
              hasPreviousPage:
                fetchMoreResult.chatMessagesByUserCount.pageInfo
                  .hasPreviousPage,
              startCursor:
                fetchMoreResult.chatMessagesByUserCount.pageInfo.startCursor,
            },
          },
        };
      },
    });

    // Maintain scroll position after loading older messages
    const containerAfter = scrollContainerRef.current;
    if (containerAfter && previousScrollHeight.current) {
      const newScrollHeight = containerAfter.scrollHeight;
      containerAfter.scrollTop = newScrollHeight - previousScrollHeight.current;
    }

    return (
      result.data?.chatMessagesByUserCount?.pageInfo?.hasPreviousPage ?? false
    );
  }, [chatId, fetchMore, loading, pageInfo, isFillingViewport]);

  // Fill viewport with messages if needed
  const fillViewport = useCallback(async () => {
    const container = scrollContainerRef.current;
    if (!container || !pageInfo?.hasPreviousPage || loading) return;

    // Check if content doesn't fill the viewport
    if (container.scrollHeight <= container.clientHeight) {
      setIsFillingViewport(true);
      const hasMore = await loadOlderMessages();
      setIsFillingViewport(false);

      // Continue filling if there are more messages and viewport still not filled
      if (hasMore) {
        // Use setTimeout to allow DOM to update
        setTimeout(() => {
          fillViewport();
        }, VIEWPORT_FILL_INTERVAL);
      }
    }
  }, [loadOlderMessages, pageInfo?.hasPreviousPage, loading]);

  // Scroll to bottom on initial load, when new messages are added, when AI starts typing, or when streaming
  useEffect(() => {
    if (
      bottomRef.current &&
      (isInitialLoad.current ||
        newMessages.length > 0 ||
        isAITyping ||
        streamingContent)
    ) {
      bottomRef.current.scrollIntoView({
        behavior: isInitialLoad.current ? "auto" : "smooth",
      });
      isInitialLoad.current = false;
    }
  }, [allMessages.length, newMessages.length, isAITyping, streamingContent]);

  // Fill viewport after initial load
  useEffect(() => {
    if (!loading && messages.length > 0 && pageInfo?.hasPreviousPage) {
      // Small delay to ensure DOM has rendered
      const timer = setTimeout(() => {
        fillViewport();
      }, VIEWPORT_FILL_DELAY);
      return () => clearTimeout(timer);
    }
  }, [loading, messages.length, pageInfo?.hasPreviousPage, fillViewport]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFillingViewport) {
          loadOlderMessages();
        }
      },
      { threshold: INTERSECTION_THRESHOLD },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadOlderMessages, isFillingViewport]);

  if (loading && messages.length === 0) {
    return <Loading />;
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto px-2 pt-3 pb-2 sm:px-4 sm:pt-4 sm:pb-2 space-y-3 sm:space-y-4"
    >
      {/* Sentinel for loading older messages */}
      <div ref={topSentinelRef} className="h-1" />

      {(loading || isFillingViewport) && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Loading...
          </div>
        </div>
      )}

      {allMessages.map((message: Message) => (
        <ChatMessage
          key={message.id}
          role={message.role}
          content={message.content}
          adapter={message.adapter}
          network_method={message.network_method}
          created_at={message.created_at}
        />
      ))}

      {/* Streaming content - show partial AI response */}
      {streamingContent && (
        <ChatMessage
          role="assistant"
          content={streamingContent}
          created_at={new Date().toISOString()}
        />
      )}

      {/* Typing indicator - show while AI is typing (including during streaming) */}
      {isAITyping && <TypingIndicator />}

      {/* Bottom anchor for scrolling to latest */}
      <div ref={bottomRef} />
    </div>
  );
}
