import { useState, useEffect, useCallback, useRef } from "react";
import { useSocketStore } from "@/store/socket-store";
import { useUserStore } from "@/store/user-store";
import axiosInstance from "@/api/axios-instance";

import type { Message } from "@/store/socket-store";

export function useMessages(supportChatSetId: number, initialPage: number = 1) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const { socket } = useSocketStore();
  const { user } = useUserStore();
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = useCallback(
    async (page: number) => {
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.get(
          `/v1/support_chat/messages?support_chat_set_id=${supportChatSetId}&page=${page}`
        );
        const newMessages: Message[] = data.results || [];

        setMessages(prev => {
          const existingIds = new Set(prev.map(msg => msg.id));
          const filteredMessages = newMessages.filter(
            msg => !existingIds.has(msg.id)
          );
          return [...prev, ...filteredMessages].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
        });

        setHasMore(data.next !== null);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [supportChatSetId]
  );

  const handleNewMessage = useCallback(
    (newMessage: Message) => {
      if (!newMessage || newMessage.support_chat_set !== supportChatSetId) {
        return;
      }

      setMessages(prev => {
        if (prev.some(msg => msg.id === newMessage.id)) return prev;
        return [...prev, newMessage].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    },
    [supportChatSetId]
  );

  const markMessagesAsRead = useCallback(() => {
    if (!socket || !messages.length) return;

    const unreadMessageIds = messages
      .filter(msg => !msg.is_read && msg.created_by !== user?.id)
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      socket.emit("read_message", { list_of_message_id: unreadMessageIds });
      setMessages(prev =>
        prev.map(msg =>
          unreadMessageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
        )
      );
    }
  }, [socket, messages, user?.id]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
  };

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    fetchMessages(page);
  }, [page, fetchMessages]);

  useEffect(() => {
    if (!socket) return;

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
      socket.off("user_message", handleNewMessage);
      socket.off("agent_message", handleNewMessage);
      socket.off("message_read");
    };
  }, [socket, handleNewMessage]);

  useEffect(() => {
    if (isAtBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isAtBottom]);

  useEffect(() => {
    markMessagesAsRead();
  }, [messages, markMessagesAsRead]);

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  return { messages, isLoading, isError, loadMore, hasMore, chatContainerRef };
}
