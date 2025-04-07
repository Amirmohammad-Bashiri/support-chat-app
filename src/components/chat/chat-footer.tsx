"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile } from "lucide-react";
import { detectTextDirection } from "@/lib/text-direction";

interface ChatFooterProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
}

export function ChatFooter({
  message,
  onMessageChange,
  onSendMessage,
}: ChatFooterProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [textDirection, setTextDirection] = useState<"rtl" | "ltr">("rtl"); // Default to RTL for Persian
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  // Update text direction when message changes
  useEffect(() => {
    setTextDirection(detectTextDirection(message));
  }, [message]);

  useEffect(() => {
    // Auto focus input on component mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div
      className={`border-t p-4 transition-all duration-300 ${
        isFocused ? "bg-gray-50" : "bg-white"
      }`}>
      <form onSubmit={handleSubmit} className="flex w-full gap-2 items-center">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
          <Paperclip className="h-5 w-5" />
        </Button>

        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={message}
            onChange={e => onMessageChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="پیام خود را بنویسید..."
            className="flex-1 pr-4 pl-10 py-6 rounded-full border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all"
            style={{
              direction: textDirection,
              textAlign: textDirection === "rtl" ? "right" : "left",
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 hover:bg-transparent">
            <Smile className="h-5 w-5" />
          </Button>
        </div>

        <Button
          type="submit"
          size="icon"
          className={`rounded-full w-12 h-12 ${
            message.trim()
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200"
          } transition-all duration-200`}
          disabled={!message.trim()}>
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
