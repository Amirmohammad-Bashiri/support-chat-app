"use client";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useUserStore } from "@/store/user-store";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCheck } from "lucide-react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div className="space-y-3 py-2">
      {hasMore && !isLoading ? <div ref={ref} className="h-1" /> : null}

      <AnimatePresence initial={false}>
        {messages.map((msg, index) => {
          const isCurrentUser = msg.created_by === room.client;
          const isSentByCurrentUser = msg.created_by === user?.id;
          const showTimeGroup =
            index === 0 ||
            new Date(msg.created_at).toDateString() !==
              new Date(messages[index - 1].created_at).toDateString();

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
              style={{ direction: "ltr" }}>
              {showTimeGroup && (
                <div className="flex justify-center my-4">
                  <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                    {new Date(msg.created_at).toLocaleDateString("fa-IR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              )}

              <div
                data-id={msg.id}
                className={`flex ${
                  isSentByCurrentUser ? "justify-end" : "justify-start"
                } items-end gap-2`}>
                {!isSentByCurrentUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    {isCurrentUser ? "C" : "A"}
                  </div>
                )}

                <div
                  className={`min-w-[120px] max-w-[280px] md:max-w-[350px] rounded-2xl px-4 py-3 shadow-sm ${
                    isSentByCurrentUser
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}>
                  <p className="text-sm leading-relaxed break-words">
                    {msg.text}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                      isSentByCurrentUser ? "text-indigo-100" : "text-gray-500"
                    }`}>
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString("fa-IR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.is_read && isSentByCurrentUser && (
                      <CheckCheck className="h-3 w-3 text-green-300" />
                    )}
                  </div>
                </div>

                {isSentByCurrentUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    {user?.id.toString().charAt(0) || "U"}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}
