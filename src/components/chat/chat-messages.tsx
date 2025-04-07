"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useUserStore } from "@/store/user-store";
import type { Room, Message } from "@/store/socket-store";

interface ChatMessagesProps {
  messages: Message[];
  room: Room;
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function ChatMessages({
  messages,
  room,
  loadMore,
  hasMore,
  isLoading,
}: ChatMessagesProps) {
  const { user } = useUserStore();

  // Observe the top of the chat for loading more messages
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Trigger loading more messages when the top is in view
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, loadMore]);

  return (
    <ul className="space-y-4">
      {hasMore && !isLoading ? <div ref={ref} className="h-1" /> : null}
      {messages.map(msg => {
        const isCurrentUser = msg.created_by === room.client;
        const isSentByCurrentUser = msg.created_by === user?.id;

        return (
          <li
            key={msg.id}
            data-id={msg.id}
            className={`flex ${
              isCurrentUser ? "justify-start" : "justify-end"
            }`}>
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                isCurrentUser
                  ? "bg-black text-white"
                  : "bg-white text-black shadow border border-gray-200"
              }`}>
              <p>{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.created_at).toLocaleTimeString()}
              </p>
              {msg.is_read && isSentByCurrentUser && (
                <p className="text-xs text-green-500 mt-1">خوانده شده</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
