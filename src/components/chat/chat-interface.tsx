"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useSupport } from "@/hooks/socket/use-socket";
import { useMessages } from "@/hooks/use-messages";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatFooter } from "@/components/chat/chat-footer";

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
  const {
    messages,
    isLoading,
    isError,
    loadMore,
    hasMore,
    chatContainerRef,
    onNewMessage,
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

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessage(message);
    setMessage("");
    scrollToBottom();
  };

  const handleEndChat = () => {
    if (isAgent) {
      endConversation();
    }
  };

  return (
    <div
      className="h-[calc(100vh-8rem)] flex flex-col relative rounded-xl overflow-hidden shadow-lg border border-gray-100"
      dir="rtl">
      <ChatHeader
        subject={room.subject}
        isAgent={isAgent}
        onEndChat={handleEndChat}
      />
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <Spinner />
          </div>
        )}

        <ChatMessages
          messages={messages}
          room={room}
          loadMore={loadMore}
          hasMore={hasMore}
          isLoading={isLoading}
        />

        {isError && (
          <div className="p-4 bg-red-50 text-red-500 rounded-lg text-center my-4">
            خطا در بارگذاری پیام‌ها
          </div>
        )}

        <AnimatePresence>
          {isTyping && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 mr-10 mt-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-xs">
                {isAgent ? "A" : "C"}
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                <div className="flex space-x-1 rtl:space-x-reverse">
                  <div
                    className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                    style={{ animationDelay: "0ms" }}></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                    style={{ animationDelay: "150ms" }}></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
                    style={{ animationDelay: "300ms" }}></div>
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
              exit={{ opacity: 0 }}
              className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-10">
              <Button
                onClick={scrollToBottom}
                className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg px-4 py-2 flex items-center hover:from-indigo-700 hover:to-purple-700 transition-all">
                <ArrowDown className="h-4 w-4 ml-2" />
                پیام‌های جدید
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ChatFooter
        message={message}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
