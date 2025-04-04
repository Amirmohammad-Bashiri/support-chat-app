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
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const newMessageCallbackRef = useRef<(() => void) | null>(null);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { socket } = useSocketStore();
  const { user } = useUserStore();

  // Use SWR for fetching messages
  const { data, error, isLoading, mutate } = useSWR(
    `/v1/support_chat/messages?support_chat_set_id=${supportChatSetId}&page=${page}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
    }
  );

  // Function to register a callback for new messages
  const onNewMessage = useCallback((callback: (() => void) | null) => {
    newMessageCallbackRef.current = callback;
  }, []);

  // Process new messages from SWR data
  useEffect(() => {
    if (data?.results) {
      setAllMessages(prev => {
        // Filter out duplicates
        const existingIds = new Set(prev.map(msg => msg.id));
        const filteredMessages = data.results.filter(
          msg => !existingIds.has(msg.id)
        );

        // Combine existing and new messages
        const combinedMessages = [...prev, ...filteredMessages];

        // Sort by created_at timestamp
        return combinedMessages.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
    }
  }, [data]);

  const handleNewMessage = useCallback(
    (newMessage: Message) => {
      if (!newMessage || newMessage.support_chat_set !== supportChatSetId) {
        return;
      }

      setAllMessages(prev => {
        if (prev.some(msg => msg.id === newMessage.id)) return prev;

        // Call the callback when a new message arrives
        if (newMessageCallbackRef.current) {
          newMessageCallbackRef.current();
        }

        return [...prev, newMessage];
      });

      // Revalidate the data
      mutate();
    },
    [supportChatSetId, mutate]
  );

  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
  };

  // Add scroll event listener
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

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("user_message", handleNewMessage);
    socket.on("agent_message", handleNewMessage);

    socket.on("message_read", (data: { list_message_instance: Message[] }) => {
      setAllMessages(prev =>
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

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (isAtBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [allMessages, isAtBottom]);

  // Intersection Observer for marking messages as read
  useEffect(() => {
    if (!chatContainerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        const unreadMessageIds: number[] = [];
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const messageId = Number(entry.target.getAttribute("data-id"));
            const message = allMessages.find(msg => msg.id === messageId);
            if (
              message &&
              !message.is_read &&
              message.created_by !== user?.id
            ) {
              unreadMessageIds.push(messageId);
            }
          }
        });

        if (unreadMessageIds.length > 0 && socket) {
          // Emit the read_message event
          socket.emit("read_message", { list_of_message_id: unreadMessageIds });

          // Immediately update the local state to mark messages as read
          setAllMessages(prev =>
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

    observerRef.current = observer;

    // Observe each message element
    allMessages.forEach(msg => {
      const messageElement = document.querySelector(`[data-id="${msg.id}"]`);
      if (messageElement) {
        observer.observe(messageElement);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [allMessages, socket, user?.id]);

  const loadMore = useCallback(() => {
    if (data?.next && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [data?.next, isLoading]);

  return {
    messages: allMessages,
    isLoading,
    isError: !!error,
    loadMore,
    hasMore: !!data?.next,
    chatContainerRef,
    onNewMessage, // Expose the callback registration function
  };
}
