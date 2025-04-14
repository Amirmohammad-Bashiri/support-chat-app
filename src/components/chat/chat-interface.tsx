"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useSupport } from "@/hooks/socket/use-socket";
import { useMessages } from "@/hooks/use-messages";
import { useMessageQueue } from "@/hooks/use-message-queue";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatFooter } from "@/components/chat/chat-footer";
import { useSocketStore } from "@/store/socket-store";
import { ConnectionStatus } from "@/components/offline/connection-status";

import type { Room } from "@/store/socket-store";

export function ChatInterface({
  room,
  isAgent = false,
}: {
  room: Room;
  isAgent?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const [initialRender, setInitialRender] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { sendMessage, endConversation } = useSupport();
  const { isConnected } = useSocketStore();
  const { queueMessage, processQueue } = useMessageQueue();

  const {
    messages,
    isLoading,
    isError,
    loadMore,
    hasMore,
    chatContainerRef,
    onNewMessage,
    addPendingMessage,
    updatePendingMessage,
    removePendingMessage,
  } = useMessages(Number(room.id), 1);

  // For detecting when user is at the bottom of the chat
  const { ref: bottomRef, inView: isBottomVisible } = useInView({
    threshold: 0.5,
    rootMargin: "0px 0px 10px 0px",
  });

  // Simulate typing indicator (in a real app, this would come from the server)
  const simulateTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setIsTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  // Update isAtBottom state when bottom visibility changes
  useEffect(() => {
    setIsAtBottom(isBottomVisible);
    if (isBottomVisible) {
      setShowNewMessageButton(false); // Hide the button when at the bottom
    }
  }, [isBottomVisible]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
      setIsAtBottom(true);
      setShowNewMessageButton(false); // Hide the button after scrolling
    }
  };

  useLayoutEffect(() => {
    if (initialRender && messages.length > 0) {
      scrollToBottom();
      setInitialRender(false);
    }
  }, [messages.length, initialRender]);

  useEffect(() => {
    const callback = () => {
      if (!isBottomVisible) {
        setShowNewMessageButton(true); // Show the button when new messages arrive
      }
      simulateTyping(); // Simulate typing when new message arrives
    };

    onNewMessage(callback);
    return () => {
      onNewMessage(null);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [onNewMessage, isBottomVisible]);

  // Auto-scroll to bottom when new messages arrive if user was already at bottom
  useEffect(() => {
    if (isAtBottom && chatContainerRef.current && messages.length > 0) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length, isAtBottom, chatContainerRef]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!message.trim()) return;

    if (!isConnected) {
      // First add the pending message to the UI
      const clientId = addPendingMessage(message);

      // Then queue it for actual sending later
      queueMessage(message, room.id)
        .then(() => {
          console.log("Message queued successfully:", message);
          // Update the pending message with the queued ID if needed
          if (clientId) {
            updatePendingMessage(clientId, { isPending: true });
          }
        })
        .catch(err => {
          console.error("Failed to queue message:", err);
          // If queueing fails, we could remove the pending message
          if (clientId) {
            removePendingMessage(clientId);
          }
        });

      setMessage("");
    } else {
      // If online, send directly
      sendMessage(message);

      // No need to add a pending message for online mode
      // as it will be immediately added via the socket event
      setMessage("");
    }

    scrollToBottom();
  };

  // Get appropriate button class based on connection status
  const getSendButtonClass = () => {
    if (!isConnected) {
      return "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700";
    }
    return "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700";
  };

  const handleEndChat = () => {
    if (isAgent) {
      endConversation();
    }
  };

  // Process the message queue when connection is restored
  useEffect(() => {
    if (isConnected) {
      console.log(
        "Connection restored in chat interface, triggering queue processing..."
      );
      processQueue();
    }
  }, [isConnected, processQueue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-[calc(100vh-5rem)] md:min-h-[calc(100vh-6rem)] flex flex-col relative rounded-xl overflow-hidden shadow-lg border border-gray-100"
      dir="rtl">
      <ChatHeader
        subject={room.subject}
        isAgent={isAgent}
        onEndChat={handleEndChat}
      />

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-2 sm:p-4 bg-gradient-to-b from-gray-50 to-white relative">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}>
                <Spinner />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ChatMessages
          messages={messages}
          room={room}
          loadMore={loadMore}
          hasMore={hasMore}
          isLoading={isLoading}
        />

        <AnimatePresence>
          {isError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 sm:p-4 bg-red-50 text-red-500 rounded-lg text-center my-2 sm:my-4 text-sm">
              خطا در بارگذاری پیام‌ها
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isTyping && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1 sm:gap-2 mr-6 sm:mr-10 mt-2">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs">
                {isAgent ? "A" : "C"}
              </motion.div>
              <div className="bg-white p-2 sm:p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                <div className="flex space-x-1 rtl:space-x-reverse">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 0,
                    }}
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-300"></motion.div>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 0.15,
                    }}
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-300"></motion.div>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: 0.3,
                    }}
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-300"></motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} className="h-1 w-full" />

        <AnimatePresence>
          {showNewMessageButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="fixed bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 z-10">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ y: [0, -4, 0] }}
                transition={{
                  y: {
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                    repeatDelay: 0.5,
                  },
                  scale: { type: "spring", stiffness: 400, damping: 10 },
                }}>
                <Button
                  onClick={scrollToBottom}
                  className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg px-3 py-1.5 sm:px-4 sm:py-2 flex items-center hover:from-indigo-700 hover:to-purple-700 transition-all text-xs sm:text-sm">
                  <motion.div
                    animate={{ y: [0, 2, 0] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 1,
                      repeatDelay: 0.5,
                    }}>
                    <ArrowDown className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                  </motion.div>
                  پیام‌های جدید
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ChatFooter
        message={message}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
        getSendButtonClass={getSendButtonClass}
      />

      {/* Show connection status indicator */}
      <ConnectionStatus roomId={room.id} />
    </motion.div>
  );
}
