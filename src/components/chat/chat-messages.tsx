"use client";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useUserStore } from "@/store/user-store";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCheck, Clock, Check } from "lucide-react";
import type { Room, Message } from "@/store/socket-store";
import { detectTextDirection } from "@/lib/text-direction";
import { useSocketStore } from "@/store/socket-store";

interface ChatMessagesProps {
  messages: Message[];
  room: Room;
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

// Extended message interface to include status
interface ExtendedMessage extends Message {
  isPending?: boolean;
  isSent?: boolean;
}

export function ChatMessages({
  messages,
  room,
  loadMore,
  hasMore,
  isLoading,
}: ChatMessagesProps) {
  const { user } = useUserStore();
  const { isConnected } = useSocketStore();
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

  // Animation variants for messages
  const messageVariants = {
    initial: (isSentByCurrentUser: boolean) => ({
      opacity: 0,
      x: isSentByCurrentUser ? 20 : -20,
      y: 20,
      scale: 0.95,
    }),
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Animation variants for time groups
  const timeGroupVariants = {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="space-y-3 py-2">
      {hasMore && !isLoading ? (
        <motion.div
          ref={ref}
          className="h-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      ) : null}

      <AnimatePresence initial={false}>
        {messages.map((msg, index) => {
          const isCurrentUser = msg.created_by === room.client;
          const isSentByCurrentUser = msg.created_by === user?.id;
          const showTimeGroup =
            index === 0 ||
            new Date(msg.created_at).toDateString() !==
              new Date(messages[index - 1].created_at).toDateString();

          // Detect text direction for this message
          const textDirection = detectTextDirection(msg.text);

          // Check message status
          const extMsg = msg as ExtendedMessage;
          const isPending = extMsg.isPending;
          const isSent = extMsg.isSent;

          // A message with a real ID (positive number) has been sent to the server
          const hasRealId = typeof msg.id === "number" && msg.id > 0;

          // Determine message status for UI
          const showPendingIndicator = isPending && !hasRealId;
          const showSentIndicator =
            (isSent || hasRealId) && !msg.is_read && isConnected;
          const showReadIndicator = msg.is_read && isConnected;

          return (
            <motion.div
              key={msg.id}
              custom={isSentByCurrentUser}
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-1"
              style={{ direction: "ltr" }}>
              {showTimeGroup && (
                <motion.div
                  className="flex justify-center my-4"
                  variants={timeGroupVariants}
                  initial="initial"
                  animate="animate">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                    {new Date(msg.created_at).toLocaleDateString("fa-IR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </motion.div>
                </motion.div>
              )}

              <div
                data-id={msg.id}
                className={`flex ${
                  isSentByCurrentUser ? "justify-end" : "justify-start"
                } items-end gap-2`}>
                {!isSentByCurrentUser && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    whileHover={{ scale: 1.1 }}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    {isCurrentUser ? "C" : "A"}
                  </motion.div>
                )}

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={`min-w-[120px] max-w-[280px] md:max-w-[350px] rounded-2xl px-4 py-3 shadow-sm ${
                    isSentByCurrentUser
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}>
                  <p
                    className="text-sm leading-relaxed break-words"
                    style={{
                      direction: textDirection,
                      textAlign: textDirection === "rtl" ? "right" : "left",
                    }}>
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

                    {/* Show different status indicators based on message state */}
                    {isSentByCurrentUser && (
                      <>
                        {showPendingIndicator && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center">
                            <Clock className="h-3 w-3 text-amber-300" />
                          </motion.div>
                        )}
                        {showSentIndicator && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center">
                            <Check className="h-3 w-3 text-green-300" />
                          </motion.div>
                        )}
                        {showReadIndicator && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 15,
                              delay: 0.3,
                            }}>
                            <CheckCheck className="h-3 w-3 text-green-300" />
                          </motion.div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>

                {isSentByCurrentUser && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                    whileHover={{ scale: 1.1 }}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    {user?.id.toString().charAt(0) || "U"}
                  </motion.div>
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
