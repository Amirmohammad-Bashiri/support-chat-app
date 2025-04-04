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
  const { sendMessage, endConversation } = useSupport();
  const { messages, isLoading, isError, loadMore, hasMore, chatContainerRef } =
    useMessages(Number(room.id), 1);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

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
        className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <ChatMessages messages={messages} room={room} />
        {isLoading && <Spinner />}
        {isError && <p>خطا در بارگذاری پیام‌ها</p>}
        <div ref={messagesEndRef} />
        <div ref={ref} className="h-1" />
      </div>
      <ChatFooter
        message={message}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
