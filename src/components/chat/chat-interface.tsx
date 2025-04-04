"use client";

import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { ArrowDown } from "lucide-react";

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

  const { sendMessage, endConversation } = useSupport();
  const {
    messages,
    isLoading,
    isError,
    loadMore,
    hasMore,
    chatContainerRef,
    onNewMessage, // New callback from useMessages hook
  } = useMessages(Number(room.id), 1);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Handle scroll position detection
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const userIsAtBottom = scrollTop + clientHeight >= scrollHeight - 20;

    setIsAtBottom(userIsAtBottom);

    if (userIsAtBottom) {
      setShowNewMessageButton(false);
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
      setIsAtBottom(true);
      setShowNewMessageButton(false);
    }
  };

  // Ensure we scroll to bottom on initial load
  useEffect(() => {
    setTimeout(scrollToBottom, 100); // Small delay to ensure content is rendered
  }, []);

  // Register callback for new message events
  useEffect(() => {
    const callback = () => {
      if (!isAtBottom) {
        setShowNewMessageButton(true);
      }
    };

    onNewMessage(callback);
    return () => onNewMessage(null); // Clean up
  }, [onNewMessage, isAtBottom]);

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, loadMore]);

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
    <div className="h-[calc(100vh-8rem)] flex flex-col relative" dir="rtl">
      <ChatHeader
        subject={room.subject}
        isAgent={isAgent}
        onEndChat={handleEndChat}
      />
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 relative">
        <ChatMessages messages={messages} room={room} />
        {isLoading && <Spinner />}
        {isError && <p>خطا در بارگذاری پیام‌ها</p>}
        <div ref={messagesEndRef} />
        <div ref={ref} className="h-1" />

        {/* New Messages Button - truly event-based */}
        {showNewMessageButton && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <Button
              onClick={scrollToBottom}
              className="rounded-full bg-black text-white shadow-lg px-4 py-2 flex items-center">
              <ArrowDown className="h-4 w-4 ml-2" />
              پیام‌های جدید
            </Button>
          </div>
        )}
      </div>
      <ChatFooter
        message={message}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
