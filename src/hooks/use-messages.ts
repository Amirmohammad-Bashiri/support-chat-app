"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import { useSocketStore } from "@/store/socket-store";
import { useUserStore } from "@/store/user-store";
import {} from "@/hooks/use-message-queue";
import axiosInstance from "@/api/axios-instance";

import type { Message } from "@/store/socket-store";

interface MessagesResponse {
  count: number;
  next: number | null;
  previous: string | null;
  results: Message[];
}

// Extended message interface to include status
interface ExtendedMessage extends Message {
  isPending?: boolean;
  isSent?: boolean;
  clientId?: string;
}

export function useMessages(supportChatSetId: number, initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const messageCallbackRef = useRef<(() => void) | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const { socket, isConnected } = useSocketStore();
  const { user } = useUserStore();
  const latestMessageTimestamp = useRef<string | null>(null);
  const pendingMessagesRef = useRef<Map<string, ExtendedMessage>>(new Map());
  const sentMessagesIdsRef = useRef<Set<number>>(new Set());

  // Add a pending message to the UI
  const addPendingMessage = useCallback(
    (text: string) => {
      if (!user) return;

      const clientId = `pending_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      const pendingMessage: ExtendedMessage = {
        id: -1 * Date.now(), // Temporary negative ID to avoid conflicts
        text,
        support_chat_set: supportChatSetId,
        is_edited: false,
        created_at: new Date().toISOString(),
        created_by: user.id,
        message_type: 1,
        is_deleted: false,
        is_read: false,
        isPending: true,
        isSent: false,
        clientId,
      };

      // Add to pending messages map
      pendingMessagesRef.current.set(clientId, pendingMessage);

      // Add to messages state
      setMessages(prev => [...prev, pendingMessage]);

      return clientId;
    },
    [supportChatSetId, user]
  );

  // Update a pending message status
  const updatePendingMessage = useCallback(
    (clientId: string, updates: Partial<ExtendedMessage>) => {
      const pendingMessage = pendingMessagesRef.current.get(clientId);
      if (!pendingMessage) return;

      // Update the pending message
      const updatedMessage = { ...pendingMessage, ...updates };
      pendingMessagesRef.current.set(clientId, updatedMessage);

      // Update in messages state
      setMessages(prev =>
        prev.map(msg =>
          msg.clientId === clientId ? { ...msg, ...updates } : msg
        )
      );
    },
    []
  );

  // Remove a pending message
  const removePendingMessage = useCallback((clientId: string) => {
    pendingMessagesRef.current.delete(clientId);
    setMessages(prev => prev.filter(msg => msg.clientId !== clientId));
  }, []);

  // Mark a message as sent
  const markMessageAsSent = useCallback((messageId: number) => {
    sentMessagesIdsRef.current.add(messageId);

    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isPending: false, isSent: true } : msg
      )
    );
  }, []);

  // Fetch messages manually
  const fetchMessages = useCallback(
    async (pageToFetch: number) => {
      if (!hasMore) return; // Prevent unnecessary fetch

      setIsLoading(true);
      setError(null);

      const container = chatContainerRef.current;
      const previousScrollHeight = container?.scrollHeight || 0;
      const previousScrollTop = container?.scrollTop || 0;

      try {
        const response = await axiosInstance.get<MessagesResponse>(
          `/v1/support_chat/messages?support_chat_set_id=${supportChatSetId}&page=${pageToFetch}`
        );

        const { results, next } = response.data;

        if (!results || !Array.isArray(results)) {
          setHasMore(false); // No more pages, stop fetching
          return;
        }

        // Mark all fetched messages as sent
        results.forEach(msg => {
          if (typeof msg.id === "number" && msg.id > 0) {
            sentMessagesIdsRef.current.add(msg.id);
          }
        });

        // Add isSent property to fetched messages
        const processedResults = results.map(msg => ({
          ...msg,
          isPending: false,
          isSent: true,
        })) as ExtendedMessage[];

        if (pageToFetch === initialPage) {
          // Preserve pending messages when refreshing
          const pendingMsgs = Array.from(pendingMessagesRef.current.values());
          setMessages([...processedResults, ...pendingMsgs]);
        } else {
          setMessages(prev => {
            // Filter out pending messages
            const regularMsgs = prev.filter(msg => !msg.isPending);
            // Add new messages and preserve pending ones
            const pendingMsgs = Array.from(pendingMessagesRef.current.values());
            return [...processedResults, ...regularMsgs, ...pendingMsgs];
          });
        }

        setHasMore(next !== null); // Ensure we stop when there's no next page

        // Restore scroll position after loading messages
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop =
            newScrollHeight - previousScrollHeight + previousScrollTop;
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [supportChatSetId, initialPage, hasMore]
  );

  // Fetch messages when the page changes
  useEffect(() => {
    fetchMessages(page);
  }, [page, fetchMessages]);

  // Register callback for new message notifications
  const onNewMessage = useCallback((callback: (() => void) | null) => {
    messageCallbackRef.current = callback;
  }, []);

  // Handle new message function
  const handleNewMessage = useCallback(
    (newMessage: Message) => {
      if (newMessage.support_chat_set !== supportChatSetId) return;

      // Mark the message as sent
      if (typeof newMessage.id === "number" && newMessage.id > 0) {
        sentMessagesIdsRef.current.add(newMessage.id);
      }

      setMessages(prev => {
        // Skip if we already have this message
        if (prev.some(msg => msg.id === newMessage.id)) return prev;

        // Notify about new message (for the "new messages" button)
        if (messageCallbackRef.current) messageCallbackRef.current();

        // Add new message at the end with sent status
        return [...prev, { ...newMessage, isPending: false, isSent: true }];
      });
    },
    [supportChatSetId]
  );

  // Handle real-time messages
  useEffect(() => {
    if (!socket) return;

    socket.on("user_message", handleNewMessage);
    socket.on("agent_message", handleNewMessage);

    socket.on("message_read", (data: { list_message_instance: Message[] }) => {
      setMessages(prev =>
        prev.map(msg => {
          const updatedMsg = data.list_message_instance.find(
            updated => updated.id === msg.id
          );
          if (updatedMsg) {
            return { ...msg, ...updatedMsg, isPending: false, isSent: true };
          }
          return msg;
        })
      );
    });

    return () => {
      socket.off("user_message");
      socket.off("agent_message");
      socket.off("message_read");
    };
  }, [socket, handleNewMessage]);

  // Update latest message timestamp
  useEffect(() => {
    if (messages.length > 0) {
      // Filter out pending messages when determining latest timestamp
      const regularMsgs = messages.filter(msg => !msg.isPending);
      if (regularMsgs.length > 0) {
        const latestMsg = regularMsgs[regularMsgs.length - 1];
        if (latestMessageTimestamp.current !== latestMsg.created_at) {
          latestMessageTimestamp.current = latestMsg.created_at;
        }
      }
    }
  }, [messages]);

  // Handle reconnections
  // fetch the new messages when the socket reconnects
  useEffect(() => {
    if (!socket || !user) return;

    const handleReconnect = async () => {
      console.log("User is back online. Fetching new messages...");
      if (!latestMessageTimestamp.current) return;

      try {
        const response = await axiosInstance.get<Message[]>(
          `/v1/support_chat/messages/with-time-stamp/?support_chat_set_id=${supportChatSetId}&last_message_timestamp=${latestMessageTimestamp.current}`
        );

        const { data } = response;

        // Mark all fetched messages as sent
        data.forEach(msg => {
          if (typeof msg.id === "number" && msg.id > 0) {
            sentMessagesIdsRef.current.add(msg.id);
          }
        });

        // Add isSent property to fetched messages
        const processedData = data.map(msg => ({
          ...msg,
          isPending: false,
          isSent: true,
        })) as ExtendedMessage[];

        // Update messages, preserving pending ones
        setMessages(prev => {
          const pendingMsgs = prev.filter(msg => msg.isPending);
          return [
            ...prev.filter(msg => !msg.isPending),
            ...processedData,
            ...pendingMsgs,
          ];
        });
      } catch (err) {
        console.error("Failed to fetch new messages:", err);
      }
    };

    socket.on("connect", handleReconnect);

    return () => {
      socket.off("connect", handleReconnect); // Proper cleanup
    };
  }, [socket, user, supportChatSetId]);

  // Update message status indicators when connection status changes
  useEffect(() => {
    // When connection status changes, update message status indicators
    setMessages(prev =>
      prev.map(msg => {
        // If the message has a real ID or is in our sent messages set, it's been sent
        const hasBeenSent =
          (typeof msg.id === "number" && msg.id > 0) ||
          sentMessagesIdsRef.current.has(Number(msg.id));

        if (hasBeenSent) {
          // Message has been sent to the server, so it's not pending
          return {
            ...msg,
            isPending: false,
            isSent: true,
          };
        } else if (msg.isPending) {
          // Message is still pending
          return msg;
        }

        return msg;
      })
    );
  }, [isConnected]);

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
              unreadMessageIds.includes(Number(msg.id))
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

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return; // Prevent unnecessary fetch attempts
    setPage(prev => prev + 1);
  }, [hasMore, isLoading]);

  return {
    messages,
    isLoading,
    isError: !!error,
    loadMore,
    hasMore,
    chatContainerRef,
    onNewMessage,
    addPendingMessage,
    updatePendingMessage,
    removePendingMessage,
    markMessageAsSent,
  };
}
