"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile, WifiOff } from "lucide-react";
import { detectTextDirection } from "@/lib/text-direction";
import { motion, AnimatePresence } from "framer-motion";
import { useMessageQueue } from "@/hooks/use-message-queue";
import { useSocketStore } from "@/store/socket-store";
import { useUserStore } from "@/store/user-store";

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
  const [queueCount, setQueueCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isConnected, currentRoom } = useSocketStore();
  const { user } = useUserStore();
  const { queueMessage, getQueueCount } = useMessageQueue();

  // Check if user is an agent (Admin role)
  const isAgent = user?.role_name === "Admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    if (!isConnected && currentRoom && !isAgent) {
      // If offline and not an agent, queue the message
      await queueMessage(message, currentRoom);
      // Clear the input
      onMessageChange("");
      // Update queue count
      updateQueueCount();
    } else {
      // If online or an agent, send normally
      onSendMessage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
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

  // Update queue count when connection status changes
  const updateQueueCount = async () => {
    if (currentRoom) {
      const count = await getQueueCount(currentRoom);
      setQueueCount(count);
    }
  };

  useEffect(() => {
    updateQueueCount();

    // Update queue count periodically
    const interval = setInterval(updateQueueCount, 5000);

    return () => clearInterval(interval);
  }, [currentRoom, isConnected]);

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`border-t p-4 transition-all duration-300 ${
        isFocused ? "bg-gray-50" : "bg-white"
      }`}>
      {!isConnected && !isAgent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
          <WifiOff className="h-4 w-4" />
          <span>
            شما آفلاین هستید. پیام‌های شما در صف قرار می‌گیرند و پس از اتصال
            مجدد ارسال می‌شوند.
            {queueCount > 0 && ` (${queueCount} پیام در صف)`}
          </span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex w-full gap-2 items-center">
        <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
            <Paperclip className="h-5 w-5" />
          </Button>
        </motion.div>

        <motion.div
          className="relative flex-1"
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.2 }}>
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
          <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 hover:bg-transparent">
              <Smile className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {message.trim() ? (
            <motion.div
              key="active-button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}>
              <Button
                type="submit"
                size="icon"
                className={`rounded-full w-12 h-12 ${
                  !isConnected && !isAgent
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                } transition-all duration-200`}>
                <motion.div
                  animate={{ x: [0, 2, 0] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 3,
                    duration: 0.3,
                  }}>
                  <Send className="h-5 w-5" />
                </motion.div>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="inactive-button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}>
              <Button
                type="submit"
                size="icon"
                className="rounded-full w-12 h-12 bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200 transition-all duration-200"
                disabled={true}>
                <Send className="h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
