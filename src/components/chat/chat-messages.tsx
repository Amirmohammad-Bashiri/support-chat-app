"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useUserStore } from "@/store/user-store";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCheck, Clock, Check, WifiOff } from "lucide-react";
import type { Room, Message } from "@/store/socket-store";
import { detectTextDirection } from "@/lib/text-direction";
import { useSocketStore } from "@/store/socket-store";
import { useMessageQueue } from "@/hooks/use-message-queue";

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
  const [queueCount, setQueueCount] = useState(0);
  const { getQueueCount } = useMessageQueue();

  // Check if user is an agent (Admin role)
  const isAgent = user?.role_name === "Admin";

  // Observe the top of the chat for loading more messages
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Trigger loading more messages when the top is in view and we're online
  useEffect(() => {
    if (inView && hasMore && !isLoading && isConnected) {
      // Only load more when connected
      loadMore();
    }
  }, [inView, hasMore, isLoading, loadMore, isConnected]);

  // Update queue count when connection status changes
  useEffect(() => {
    const updateQueueCount = async () => {
      if (room?.id) {
        const count = await getQueueCount(room.id);
        setQueueCount(count);
      }
    };

    updateQueueCount();

    // Update queue count periodically
    const interval = setInterval(updateQueueCount, 5000);

    return () => clearInterval(interval);
  }, [room?.id, getQueueCount, isConnected]);

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
      {/* Offline notification banner */}
      <AnimatePresence>
        {!isConnected && !isAgent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 bg-amber-100 p-2 rounded-full">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(217, 119, 6, 0.4)",
                      "0 0 0 10px rgba(217, 119, 6, 0)",
                      "0 0 0 0 rgba(217, 119, 6, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="relative">
                  <WifiOff className="h-5 w-5 text-amber-600" />
                </motion.div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-amber-800">
                  حالت آفلاین فعال است
                </p>
                <p className="text-amber-700 text-xs mt-1">
                  پیام‌های شما در دستگاه شما ذخیره می‌شوند و به محض اتصال مجدد
                  به اینترنت به صورت خودکار ارسال خواهند شد.
                  {queueCount > 0 && ` (${queueCount} پیام در صف ارسال)`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              key={msg.id || msg.created_by}
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
                      ? showPendingIndicator
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-br-none"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}>
                  {showPendingIndicator && (
                    <div className="flex items-center justify-start gap-1 mb-1 text-xs text-amber-100">
                      <Clock className="h-3 w-3" />
                      <span>ارسال پس از اتصال مجدد</span>
                    </div>
                  )}
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
