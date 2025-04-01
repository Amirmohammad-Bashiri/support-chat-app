"use client";

import { useState } from "react";
import { useSupport } from "@/hooks/socket/use-socket";
// import { useMessages } from "@/hooks/use-messages";
// import { useUserStore } from "@/store/user-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import {
  Card,
  // CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Room } from "@/store/socket-store";

interface ChatInterfaceProps {
  room: Room;
  isAgent?: boolean;
}

export function ChatInterface({ room, isAgent = false }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const { sendMessage, endConversation } = useSupport();
  // const { messages, isLoading, isError, mutate } = useMessages(room.id);
  // const { user } = useUserStore();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      await sendMessage(message);
      setMessage("");
      // mutate(); // Refresh messages after sending
    }
  };

  const handleEndChat = () => {
    if (isAgent) {
      endConversation();
    }
  };

  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col" dir="rtl">
      <CardHeader className="border-b bg-black text-white">
        <CardTitle className="flex justify-between items-center">
          <span>
            {isAgent ? `گفتگو با کاربر: ${room.client}` : "گفتگوی پشتیبانی"}
          </span>
          {isAgent && (
            <Button variant="destructive" onClick={handleEndChat}>
              پایان گفتگو
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      {/* <CardContent className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4">
          {isLoading && <p>در حال بارگذاری پیام‌ها...</p>}
          {isError && <p>خطا در بارگذاری پیام‌ها</p>}
          {messages?.map(msg => {
            const isCurrentUser = msg.senderId === room.client; // Adjust logic as needed
            return (
              <div
                key={msg.id}
                className={`flex ${
                  isCurrentUser ? "justify-start" : "justify-end"
                }`}>
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isCurrentUser
                      ? "bg-black text-white"
                      : "bg-white text-black shadow border border-gray-200"
                  }`}>
                  <p>{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent> */}
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
