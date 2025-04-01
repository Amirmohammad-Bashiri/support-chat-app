import { useState, useEffect, useCallback } from "react";

import axiosInstance from "@/api/axios-instance";

import type { Message } from "@/store/socket-store";

export function useMessages(supportChatSetId: number, initialPage: number = 1) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = useCallback(
    async (page: number) => {
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.get(
          `/v1/support_chat/messages?support_chat_set_id=${Number(
            supportChatSetId
          )}&page=${page}`
        );
        const newMessages: Message[] = data.messages || [];
        setMessages(prev => [...prev, ...newMessages]);
        setHasMore(newMessages.length > 0);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [supportChatSetId]
  );

  useEffect(() => {
    fetchMessages(page);
  }, [page, fetchMessages]);

  const loadMore = () => {
    if (hasMore && !isLoading) setPage(prev => prev + 1);
  };

  return { messages, isLoading, isError, loadMore, hasMore };
}
