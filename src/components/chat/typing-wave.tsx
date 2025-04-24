"use client";

import { motion } from "framer-motion";

export function TypingWave() {
  return (
    <div className="flex items-center justify-center h-6 w-16">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 120 30"
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map(i => (
          <motion.rect
            key={i}
            x={i * 15 + 5}
            y="10"
            width="6"
            height="10"
            rx="2"
            fill="url(#gradient)"
            initial={{ height: 10, y: 10 }}
            animate={{
              height: [10, 20, 10],
              y: [10, 5, 10],
            }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
