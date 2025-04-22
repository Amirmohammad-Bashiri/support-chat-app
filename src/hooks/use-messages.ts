"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import { useSocketStore } from "@/store/socket-store";
import { useUserStore } from "@/store/user-store";
import { useMessageQueue, ExtendedMessage } from "@/hooks/use-message-queue";
import axiosInstance from "@/api/axios-instance";

import type { Message } from "@/store/socket-store";

interface MessagesResponse {
  count: number;
  next: number | null;
  previous: string | null;
  results: Message[];
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
  const initialLoadCompleteRef = useRef(false);

  const { socket, isConnected } = useSocketStore();
  const { user } = useUserStore();
  const latestMessageTimestamp = useRef<string | null>(null);

  // Use the message queue hook for managing pending messages and offline functionality
  const {
    addPendingMessage: addPendingToQueue,
    updatePendingMessage: updatePendingInQueue,
    removePendingMessage: removePendingFromQueue,
    getPendingMessages,
    markMessageAsSent,
    messageExists,
    matchPendingMessageToServer,
    sentMessagesIdsRef,
    messageIdsRef,
  } = useMessageQueue();

  // Wrapper function for addPendingMessage that adapts to our hook's interface
  const addPendingMessage = useCallback(
    (text: string) => {
      const clientId = addPendingToQueue(text, supportChatSetId);

      if (clientId && user) {
        // Create a pending message object
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
          sender_first_name: user.first_name,
          sender_last_name: user.last_name,
          clientId, // Using clientId here to track the pending message
        };

        // Add to the UI by updating messages state
        setMessages(prev => [...prev, pendingMessage]);
      }

      return clientId;
    },
    [addPendingToQueue, supportChatSetId, user]
  );

  // Wrapper function for updatePendingMessage
  const updatePendingMessage = useCallback(
    (clientId: string, updates: Partial<ExtendedMessage>) => {
      updatePendingInQueue(clientId, updates);

      // Update in messages state
      setMessages(prev =>
        prev.map(msg =>
          msg.clientId === clientId ? { ...msg, ...updates } : msg
        )
      );
    },
    [updatePendingInQueue]
  );

  // Wrapper function for removePendingMessage
  const removePendingMessage = useCallback(
    (clientId: string) => {
      removePendingFromQueue(clientId);
      setMessages(prev => prev.filter(msg => msg.clientId !== clientId));
    },
    [removePendingFromQueue]
  );

  // Fetch messages manually
  const fetchMessages = useCallback(
    async (pageToFetch: number) => {
      if (!hasMore && pageToFetch !== initialPage) return; // Prevent unnecessary fetch, but always allow initial page fetch

      setIsLoading(true);
      setError(null);

      const container = chatContainerRef.current;
      const previousScrollHeight = container?.scrollHeight || 0;
      const previousScrollTop = container?.scrollTop || 0;

      try {
        console.log(`Fetching messages for page ${pageToFetch}`);
        const response = await axiosInstance.get<MessagesResponse>(
          `/v1/support_chat/messages?support_chat_set_id=${supportChatSetId}&page=${pageToFetch}`
        );

        const { results, next } = response.data;

        if (!results || !Array.isArray(results)) {
          setHasMore(false); // No more pages, stop fetching
          return;
        }

        console.log(`Received ${results.length} messages from server`);

        // Process all messages, don't filter out existing ones on initial load
        // This ensures we don't lose messages that were sent while offline
        const processedResults = results.map(msg => {
          // Add the message ID to our tracking set
          if (typeof msg.id === "number" && msg.id > 0) {
            messageIdsRef.current.add(msg.id);
            sentMessagesIdsRef.current.add(msg.id);
          }

          return {
            ...msg,
            isPending: false,
            isSent: true,
          } as ExtendedMessage;
        });

        if (pageToFetch === initialPage) {
          // On initial page load, replace all non-pending messages
          // but keep pending messages that haven't been sent yet
          const pendingMsgs = getPendingMessages().filter(
            msg => msg.support_chat_set === supportChatSetId
          );

          console.log(
            `Setting ${processedResults.length} server messages and ${pendingMsgs.length} pending messages`
          );

          setMessages([...processedResults, ...pendingMsgs]);
          initialLoadCompleteRef.current = true;
        } else {
          // For pagination, prepend new messages to existing ones
          setMessages(prev => {
            return [...processedResults, ...prev];
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
    [
      supportChatSetId,
      initialPage,
      hasMore,
      getPendingMessages,
      messageIdsRef,
      sentMessagesIdsRef,
    ]
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

      // Skip if we already have this message
      if (messageExists(newMessage.id)) {
        console.log("Skipping duplicate message:", newMessage.id);
        return;
      }

      console.log("Received new message:", newMessage);

      // Mark the message as sent
      if (typeof newMessage.id === "number" && newMessage.id > 0) {
        markMessageAsSent(newMessage.id);
      }

      // Notify about new message (for the "new messages" button)
      if (messageCallbackRef.current) messageCallbackRef.current();

      // Add new message at the end with sent status
      setMessages(prev => [
        ...prev,
        { ...newMessage, isPending: false, isSent: true },
      ]);
    },
    [supportChatSetId, messageExists, markMessageAsSent]
  );

  // Handle real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleServerMessage = (data: Message) => {
      // Handle the new message
      handleNewMessage(data);

      // Check if this message matches any of our pending messages
      const matchingClientId = matchPendingMessageToServer(data);
      if (matchingClientId) {
        console.log(
          "Found matching pending message, removing:",
          matchingClientId
        );
        removePendingMessage(matchingClientId);
      }
    };

    socket.on("user_message", handleServerMessage);
    socket.on("agent_message", handleServerMessage);

    socket.on("message_read", (data: { list_message_instance: Message[] }) => {
      // Create a Map for efficient lookup of updated messages
      const updatedMessagesMap = new Map<number, Message>();
      data.list_message_instance.forEach(msg => {
        if (typeof msg.id === "number") {
          updatedMessagesMap.set(msg.id, msg);
        }
      });

      setMessages(prev =>
        prev.map(msg => {
          // Check if the current message exists in the updated messages map
          const updatedMsg = updatedMessagesMap.get(Number(msg.id));
          if (updatedMsg) {
            // If found, merge the updates
            return { ...msg, ...updatedMsg, isPending: false, isSent: true };
          }
          // Otherwise, return the original message
          return msg;
        })
      );
    });

    return () => {
      socket.off("user_message", handleServerMessage);
      socket.off("agent_message", handleServerMessage);
      socket.off("message_read");
    };
  }, [
    socket,
    handleNewMessage,
    matchPendingMessageToServer,
    removePendingMessage,
  ]);

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

        // Filter out messages we already have
        const newMessages = data.filter(msg => !messageExists(msg.id));

        // Mark all fetched messages as sent
        newMessages.forEach(msg => {
          if (typeof msg.id === "number" && msg.id > 0) {
            markMessageAsSent(msg.id);
          }
        });

        // Add isSent property to fetched messages
        const processedData = newMessages.map(msg => ({
          ...msg,
          isPending: false,
          isSent: true,
        })) as ExtendedMessage[];

        // Only add new messages if we have any
        if (processedData.length > 0) {
          // Update messages, preserving pending ones
          setMessages(prev => {
            const pendingMsgs = prev.filter(msg => msg.isPending);
            return [
              ...prev.filter(msg => !msg.isPending),
              ...processedData,
              ...pendingMsgs,
            ];
          });
        }
      } catch (err) {
        console.error("Failed to fetch new messages:", err);
      }
    };

    socket.on("connect", handleReconnect);

    return () => {
      socket.off("connect", handleReconnect); // Proper cleanup
    };
  }, [socket, user, supportChatSetId, messageExists, markMessageAsSent]);

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
  }, [isConnected, sentMessagesIdsRef]);

  // Mark messages as read when visible
  useEffect(() => {
    if (!chatContainerRef.current || !socket || !user || messages.length === 0)
      return;

    // Create a Map of messages by ID for quick access
    const messagesMap = new Map<number, ExtendedMessage>();
    messages.forEach(msg => {
      if (typeof msg.id === "number" && msg.id > 0) {
        messagesMap.set(msg.id, msg);
      }
    });

    const observer = new IntersectionObserver(
      entries => {
        const unreadMessageIdsToUpdate: number[] = [];

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const messageId = Number(entry.target.getAttribute("data-id"));
            // Use the Map for faster lookup
            const message = messagesMap.get(messageId);

            // Check if the message exists, is unread, and not sent by the current user
            if (message && !message.is_read && message.created_by !== user.id) {
              unreadMessageIdsToUpdate.push(messageId);
              // Optimistically mark as read in the map to avoid duplicate processing
              messagesMap.set(messageId, { ...message, is_read: true });
            }
          }
        });

        if (unreadMessageIdsToUpdate.length > 0) {
          // Emit the read event to the server
          socket.emit("read_message", {
            list_of_message_id: unreadMessageIdsToUpdate,
          });

          // Update the state more efficiently
          setMessages(prev =>
            prev.map(
              msg =>
                // Check if the message ID is in the list of messages to update
                unreadMessageIdsToUpdate.includes(Number(msg.id))
                  ? { ...msg, is_read: true } // Mark as read
                  : msg // Otherwise, keep the message as is
            )
          );
        }
      },
      { root: chatContainerRef.current, threshold: 0.1 }
    );

    // Observe each message element that has a data-id attribute
    const messageElements =
      chatContainerRef.current.querySelectorAll("[data-id]");
    messageElements.forEach(el => observer.observe(el));

    // Cleanup function to disconnect the observer when the component unmounts or dependencies change
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
