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
      className="border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex justify-between items-center">
      <motion.div
        className="flex items-center gap-2"
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
          <MessageCircle className="h-5 w-5" />
        </motion.div>
        <motion.span
          className="font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}>
          {isAgent ? `موضوع: ${subject}` : "موضوع"}
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
            className="text-white hover:bg-white/20 hover:text-white">
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}>
              <X className="h-4 w-4 ml-2" />
            </motion.div>
            پایان گفتگو
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
