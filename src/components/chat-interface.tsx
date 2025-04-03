"use client";

import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { Send, ArrowDown } from "lucide-react";

import { useSupport } from "@/hooks/socket/use-socket";
import { useMessages } from "@/hooks/use-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import type { Room } from "@/store/socket-store";

interface ChatInterfaceProps {
  room: Room;
  isAgent?: boolean;
}

export function ChatInterface({ room, isAgent = false }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
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

  // Scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
    setHasNewMessages(false);
    setNewMessagesCount(0); // Reset new messages count
  };

  // Detect if the user is at the bottom of the chat
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isUserAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    setIsAtBottom(isUserAtBottom);

    // If user scrolls to bottom manually, reset the new messages flag and count
    if (isUserAtBottom) {
      setHasNewMessages(false);
      setNewMessagesCount(0);
    }
  };

  // Check for new messages
  useEffect(() => {
    // If messages length has increased and user is not at bottom
    if (messages.length > lastMessageCount && !isAtBottom) {
      setHasNewMessages(true);
      // Increment the new messages count by the difference
      setNewMessagesCount(prev => prev + (messages.length - lastMessageCount));
    }

    // Update the last message count
    setLastMessageCount(messages.length);

    // If user is at bottom, scroll to bottom with new messages
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom, lastMessageCount]);

  // Use useEffect to handle loadMore when inView changes
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, loadMore]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessage(message);
    setMessage("");

    // Auto-scroll to bottom when sending a message
    scrollToBottom();
  };

  const handleEndChat = () => isAgent && endConversation();

  const renderMessages = () => {
    const uniqueMessages = Array.from(
      new Map(messages.map(msg => [msg.id, msg])).values()
    );

    return uniqueMessages.map(msg => {
      const isCurrentUser = msg.created_by === room.client;
      return (
        <div
          key={msg.id}
          className={`flex ${isCurrentUser ? "justify-start" : "justify-end"}`}>
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
          </div>
        </div>
      );
    });
  };

  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col relative" dir="rtl">
      <CardHeader className="border-b bg-black text-white">
        <CardTitle className="flex justify-between items-center">
          <span>{isAgent ? `موضوع: ${room.subject}` : "موضوع"}</span>
          {isAgent && (
            <Button variant="destructive" onClick={handleEndChat}>
              پایان گفتگو
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div ref={ref} className="h-1" />
        <div className="space-y-4">
          {renderMessages()}
          {isLoading && <Spinner />}
          {isError && <p>خطا در بارگذاری پیام‌ها</p>}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      {/* Fixed position button that's always visible */}
      {!isAtBottom && hasNewMessages && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            onClick={scrollToBottom}
            className="bg-black text-white rounded-full px-4 shadow-lg"
            size="sm">
            <ArrowDown className="h-4 w-4 ml-2" />
            {newMessagesCount > 1
              ? `${newMessagesCount} پیام جدید`
              : "پیام جدید"}
          </Button>
        </div>
      )}

      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            className="flex-1 text-right"
          />
          <Button
            type="submit"
            className="bg-black hover:bg-black/90 text-white">
            <Send className="h-4 w-4 ml-2" />
            ارسال
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
