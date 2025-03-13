"use client";

import { useState } from "react";
import { useSupport } from "@/hooks/socket/use-socket";
import { useUserStore } from "@/store/user-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
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
  const { user } = useUserStore();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  const handleEndChat = () => {
    if (isAgent) {
      endConversation();
    }
  };

  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex justify-between items-center">
          <span>
            {isAgent ? `Chat with User: ${room.userId}` : "Support Chat"}
          </span>
          {isAgent && (
            <Button variant="destructive" onClick={handleEndChat}>
              End Conversation
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {room.messages.map(msg => {
            const isCurrentUser = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}>
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isCurrentUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
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
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
      </CardFooter>
    </Card>
  );
}
