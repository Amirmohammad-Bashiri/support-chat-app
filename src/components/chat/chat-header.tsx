"use client";

import { Button } from "@/components/ui/button";
import { X, MessageCircle } from "lucide-react";

interface ChatHeaderProps {
  subject: string;
  isAgent?: boolean;
  onEndChat?: () => void;
}

export function ChatHeader({
  subject,
  isAgent = false,
  onEndChat,
}: ChatHeaderProps) {
  return (
    <div className="border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <span className="font-medium">
          {isAgent ? `موضوع: ${subject}` : "موضوع"}
        </span>
      </div>
      {isAgent && (
        <Button
          variant="ghost"
          onClick={onEndChat}
          className="text-white hover:bg-white/20 hover:text-white">
          <X className="h-4 w-4 ml-2" />
          پایان گفتگو
        </Button>
      )}
    </div>
  );
}
