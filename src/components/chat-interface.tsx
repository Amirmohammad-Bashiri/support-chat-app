"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Send } from "lucide-react";

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
  const { sendMessage, endConversation } = useSupport();
  const { messages, isLoading, isError, loadMore, hasMore } = useMessages(
    Number(room.id), // Ensure room.id is treated as a number
    1
  );

  const { ref, inView } = useInView({
    threshold: 0.1, // Trigger when 10% of the element is visible
    triggerOnce: false, // Allow repeated triggers
  });

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
    <Card className="h-[calc(100vh-8rem)] flex flex-col" dir="rtl">
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
      <CardContent className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div ref={ref} className="h-1" /> {/* Intersection observer trigger */}
        <div className="space-y-4">
          {renderMessages()}
          {isLoading && <Spinner />} {/* Show spinner when loading */}
          {isError && <p>خطا در بارگذاری پیام‌ها</p>}
        </div>
      </CardContent>
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
