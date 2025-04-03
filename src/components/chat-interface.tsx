"use client";

import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

import { useSupport } from "@/hooks/socket/use-socket";
import { useMessages } from "@/hooks/use-messages";
import { Spinner } from "@/components/ui/spinner";
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
  const [lastMessageCount, setLastMessageCount] = useState(0);

  const { sendMessage, endConversation } = useSupport();
  const { messages, isLoading, isError, loadMore, hasMore } = useMessages(
    Number(room.id),
    1
  );

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isUserAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setIsAtBottom(isUserAtBottom);
  };

  useEffect(() => {
    if (messages.length > lastMessageCount && !isAtBottom) {
      // User is not at the bottom, but new messages have arrived
    }

    setLastMessageCount(messages.length);

    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom, lastMessageCount]);

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

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col relative" dir="rtl">
      <ChatHeader
        subject={room.subject}
        isAgent={isAgent}
        onEndChat={isAgent ? endConversation : undefined}
      />
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div ref={ref} className="h-1" />
        <ChatMessages messages={messages} room={room} />
        {isLoading && <Spinner />}
        {isError && <p>خطا در بارگذاری پیام‌ها</p>}
        <div ref={messagesEndRef} />
      </div>
      <ChatFooter
        message={message}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
