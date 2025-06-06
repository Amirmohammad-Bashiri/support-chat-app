"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Smile } from "lucide-react";

import { detectTextDirection } from "@/lib/text-direction";
import { useSocketStore } from "@/store/socket-store";
import { useSupport } from "@/hooks/socket/use-socket";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CustomEmojiPicker } from "./custom-emoji-picker";

interface ChatFooterProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  getSendButtonClass?: () => string;
  roomId: number;
}

export function ChatFooter({
  message,
  onMessageChange,
  onSendMessage,
  getSendButtonClass = () =>
    "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
  roomId,
}: ChatFooterProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [textDirection, setTextDirection] = useState<"rtl" | "ltr">("rtl");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isConnected } = useSocketStore();
  const { emitTyping } = useSupport();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;
    onSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onMessageChange(message + emoji);
    setEmojiPickerOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onMessageChange(e.target.value);
    if (emitTyping) emitTyping(roomId);
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
        <div className="hidden sm:block">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full">
            <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        <motion.div
          className="relative flex-1"
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.2 }}>
          <Input
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="پیام خود را بنویسید..."
            className="flex-1 pr-4 pl-10 py-3 sm:py-6 rounded-full border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all text-sm sm:text-base"
            style={{
              direction: textDirection,
              textAlign: textDirection === "rtl" ? "right" : "left",
            }}
          />

          <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
            <PopoverTrigger asChild>
              <div className="absolute left-2 top-1/2 -translate-y-1/2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-gray-400 hover:text-indigo-600 hover:bg-transparent h-8 w-8">
                  <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              sideOffset={5}
              className="p-0 border-none shadow-lg w-auto"
              onInteractOutside={() => setEmojiPickerOpen(false)}>
              <div className="emoji-picker-container" dir="ltr">
                <CustomEmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>
            </PopoverContent>
          </Popover>
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
                className={`rounded-full w-9 h-9 sm:w-12 sm:h-12 ${
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
                  <Send className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
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
                className="rounded-full w-9 h-9 sm:w-12 sm:h-12 bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200 transition-all duration-200"
                disabled={true}>
                <Send className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
