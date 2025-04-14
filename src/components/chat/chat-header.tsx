"use client";

import { Button } from "@/components/ui/button";
import { X, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 sm:p-4 flex justify-between items-center">
      <motion.div
        className="flex items-center gap-1 sm:gap-2"
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}>
        <motion.div
          animate={{
            rotate: [0, -10, 10, -5, 5, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 10,
          }}>
          <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        </motion.div>
        <motion.span
          className="font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-[250px] md:max-w-[350px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}>
          {`موضوع: ${subject}`}
        </motion.span>
      </motion.div>
      {isAgent && (
        <motion.div
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            onClick={onEndChat}
            className="text-white hover:bg-white/20 hover:text-white text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-10 flex items-center gap-1">
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>پایان گفتگو</span>
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
