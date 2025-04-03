import { useState, useEffect, useCallback } from "react";
import { useSocketStore } from "@/store/socket-store"; // Import socket store

import axiosInstance from "@/api/axios-instance";

import type { Message } from "@/store/socket-store";

export function useMessages(supportChatSetId: number, initialPage: number = 1) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const { socket } = useSocketStore(); // Access socket from the store

  const fetchMessages = useCallback(
    async (page: number) => {
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.get(
          `/v1/support_chat/messages?support_chat_set_id=${Number(
            supportChatSetId
          )}&page=${page}`
        );
        const newMessages: Message[] = data.results || []; // Use results array from the response
        setMessages(prev => [...prev, ...newMessages]);
        setHasMore(data.next !== null); // Check if there's a next page
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
      console.log("Received new message:", newMessage); // Debug log

      if (!newMessage || typeof newMessage.support_chat_set === "undefined") {
        console.error("Invalid message received:", newMessage); // Debug log for invalid messages
        return;
      }

      if (newMessage.support_chat_set === supportChatSetId) {
        setMessages(prev => {
          // Avoid adding duplicate messages
          if (prev.some(msg => msg.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
    },
    [supportChatSetId]
  );

  useEffect(() => {
    fetchMessages(page);
  }, [page, fetchMessages]);

  useEffect(() => {
    if (socket) {
      socket.on("user_message", (message: Message) => {
        console.log("Received user_message:", message); // Log the message
        handleNewMessage(message); // Pass the message directly
      });

      socket.on("agent_message", (message: Message) => {
        console.log("Received agent_message:", message); // Log the message
        handleNewMessage(message); // Pass the message directly
      });

      return () => {
        socket.off("user_message");
        socket.off("agent_message");
      };
    }
  }, [socket, handleNewMessage]);

  const loadMore = () => {
    if (hasMore && !isLoading) setPage(prev => prev + 1);
  };

  return { messages, isLoading, isError, loadMore, hasMore };
}
