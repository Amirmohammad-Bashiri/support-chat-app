import { useState, useEffect, useCallback, useRef } from "react";
import { useSocketStore } from "@/store/socket-store";
import { useUserStore } from "@/store/user-store";
import axiosInstance from "@/api/axios-instance";

import type { Message } from "@/store/socket-store";

interface MessagesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Message[];
}

export function useMessages(supportChatSetId: number, initialPage: number = 1) {
  const [page, setPage] = useState(initialPage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const messageCallbackRef = useRef<(() => void) | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const { socket } = useSocketStore();
  const { user } = useUserStore();

  // Fetch messages manually
  const fetchMessages = useCallback(
    async (pageToFetch: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get<MessagesResponse>(
          `/v1/support_chat/messages?support_chat_set_id=${supportChatSetId}&page=${pageToFetch}`
        );

        const { results, next } = response.data;

        if (pageToFetch === initialPage) {
          setMessages(results);
        } else {
          setMessages(prev => [...results, ...prev]);
        }

        setHasMore(!!next);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [supportChatSetId, initialPage]
  );

  // Fetch messages when the page changes
  useEffect(() => {
    fetchMessages(page);
  }, [page, fetchMessages]);

  // Register callback for new message notifications
  const onNewMessage = useCallback((callback: (() => void) | null) => {
    messageCallbackRef.current = callback;
  }, []);

  // Handle real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.support_chat_set !== supportChatSetId) return;

      setMessages(prev => {
        // Skip if we already have this message
        if (prev.some(msg => msg.id === newMessage.id)) return prev;

        // Notify about new message (for the "new messages" button)
        if (messageCallbackRef.current) messageCallbackRef.current();

        // Add new message at the end
        return [...prev, newMessage];
      });
    };

    socket.on("user_message", handleNewMessage);
    socket.on("agent_message", handleNewMessage);

    socket.on("message_read", (data: { list_message_instance: Message[] }) => {
      setMessages(prev =>
        prev.map(
          msg =>
            data.list_message_instance.find(updated => updated.id === msg.id) ||
            msg
        )
      );
    });

    return () => {
      socket.off("user_message");
      socket.off("agent_message");
      socket.off("message_read");
    };
  }, [socket, supportChatSetId]);

  // Mark messages as read when visible
  useEffect(() => {
    if (!chatContainerRef.current || !socket || !user || messages.length === 0)
      return;

    const observer = new IntersectionObserver(
      entries => {
        const unreadMessageIds: number[] = [];

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const messageId = Number(entry.target.getAttribute("data-id"));
            const message = messages.find(msg => msg.id === messageId);

            if (message && !message.is_read && message.created_by !== user.id) {
              unreadMessageIds.push(messageId);
            }
          }
        });

        if (unreadMessageIds.length > 0) {
          socket.emit("read_message", { list_of_message_id: unreadMessageIds });

          setMessages(prev =>
            prev.map(msg =>
              unreadMessageIds.includes(msg.id)
                ? { ...msg, is_read: true }
                : msg
            )
          );
        }
      },
      { root: chatContainerRef.current, threshold: 0.1 }
    );

    // Observe each message element
    const messageElements = document.querySelectorAll("[data-id]");
    messageElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [messages, socket, user]);

  // Handle scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Auto-scroll to bottom for new messages when already at bottom
  useEffect(() => {
    if (isAtBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages.length, isAtBottom]);

  // Simple load more function for pagination
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoading]);

  return {
    messages,
    isLoading,
    isError: !!error,
    loadMore,
    hasMore,
    chatContainerRef,
    onNewMessage,
  };
}
