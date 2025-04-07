"use client";

import { useState, useEffect, useLayoutEffect } from "react";
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
  const [initialRender, setInitialRender] = useState(true);

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

  // Update isAtBottom state when bottom visibility changes
  useEffect(() => {
    setIsAtBottom(isBottomVisible);
    if (isBottomVisible) {
      setShowNewMessageButton(false); // Hide the button when at the bottom
    }
  }, [isBottomVisible]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
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
    };

    onNewMessage(callback);
    return () => onNewMessage(null);
  }, [onNewMessage, isBottomVisible]);

  // Auto-scroll to bottom when new messages arrive if user was already at bottom
  useEffect(() => {
    if (isAtBottom && chatContainerRef.current && messages.length > 0) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
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
    <div className="h-[calc(100vh-8rem)] flex flex-col relative" dir="rtl">
      <ChatHeader
        subject={room.subject}
        isAgent={isAgent}
        onEndChat={handleEndChat}
      />
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 relative">
        {isLoading && <Spinner />}
        <ChatMessages
          messages={messages}
          room={room}
          loadMore={loadMore}
          hasMore={hasMore}
          isLoading={isLoading}
        />
        {isError && <p>خطا در بارگذاری پیام‌ها</p>}
        <div ref={bottomRef} className="h-1 w-full" />{" "}
        {/* Bottom observer element */}
        {showNewMessageButton && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10">
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
