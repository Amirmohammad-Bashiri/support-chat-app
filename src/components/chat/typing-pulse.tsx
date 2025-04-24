"use client";

import { motion } from "framer-motion";

export function TypingPulse() {
  return (
    <div className="flex items-center justify-center gap-1">
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          delay: 0.2,
          ease: "easeInOut",
        }}
        className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          delay: 0.4,
          ease: "easeInOut",
        }}
        className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
      />
    </div>
  );
}
