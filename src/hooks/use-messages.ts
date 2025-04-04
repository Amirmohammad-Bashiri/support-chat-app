import { useState, useEffect, useCallback, useRef } from "react";
import useSWR from "swr";
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

const fetcher = async (url: string) => {
  const response = await axiosInstance.get(url);
  return response.data as MessagesResponse;
};

export function useMessages(supportChatSetId: number, initialPage: number = 1) {
  const [page, setPage] = useState(initialPage);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messageCallbackRef = useRef<(() => void) | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const { socket } = useSocketStore();
  const { user } = useUserStore();

  // Use SWR for fetching messages
  const { data, error, isLoading } = useSWR(
    `/v1/support_chat/messages?support_chat_set_id=${supportChatSetId}&page=${page}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Register callback for new message notifications
  const onNewMessage = useCallback((callback: (() => void) | null) => {
    messageCallbackRef.current = callback;
  }, []);

  console.log("messages", data);
  // Handle messages from API
  useEffect(() => {
    if (!data?.results) return;

    if (page === initialPage) {
      // For the initial page, replace the messages
      setMessages(data.results);
    } else {
      // For subsequent pages, append older messages
      setMessages(prev => [...data.results, ...prev]);
    }
  }, [data, page, initialPage]);

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
    if (data?.next && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [data?.next, isLoading]);

  return {
    messages,
    isLoading,
    isError: !!error,
    loadMore,
    hasMore: !!data?.next,
    chatContainerRef,
    onNewMessage,
  };
}
