"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile } from "lucide-react";
import { detectTextDirection } from "@/lib/text-direction";
import { motion, AnimatePresence } from "framer-motion";
import { useSocketStore } from "@/store/socket-store";

interface ChatFooterProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  getSendButtonClass?: () => string;
}

export function ChatFooter({
  message,
  onMessageChange,
  onSendMessage,
  getSendButtonClass = () =>
    "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
}: ChatFooterProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [textDirection, setTextDirection] = useState<"rtl" | "ltr">("rtl"); // Default to RTL for Persian
  const inputRef = useRef<HTMLInputElement>(null);

  const { isConnected } = useSocketStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;
    onSendMessage();
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

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`border-t p-2 sm:p-4 transition-all duration-300 ${
        isFocused ? "bg-gray-50" : "bg-white"
      }`}>
      <form
        onSubmit={handleSubmit}
        className="flex w-full gap-1 sm:gap-2 items-center">
        <motion.div
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          className="hidden sm:block">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
            <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
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
            className="flex-1 pr-4 pl-10 py-4 sm:py-6 rounded-full border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all text-sm sm:text-base"
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
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 hover:bg-transparent h-8 w-8">
              <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
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
                className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 ${
                  !isConnected
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                    : getSendButtonClass()
                } transition-all duration-200 relative`}>
                {!isConnected && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(245, 158, 11, 0.4)",
                        "0 0 0 8px rgba(245, 158, 11, 0)",
                        "0 0 0 0 rgba(245, 158, 11, 0.4)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "loop",
                    }}
                  />
                )}
                <motion.div
                  animate={{ x: [0, 2, 0] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: 3,
                    duration: 0.3,
                  }}>
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
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
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200 transition-all duration-200"
                disabled={true}>
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
