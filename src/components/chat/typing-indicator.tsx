"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TypingWave } from "./typing-wave";
import { TypingPulse } from "./typing-pulse";

type TypingIndicatorProps = {
  variant?: "dots" | "wave" | "pulse" | "circle";
};

export function TypingIndicator({ variant = "wave" }: TypingIndicatorProps) {
  // Randomly switch between variants for a cool demo effect
  const [currentVariant, setCurrentVariant] = useState(variant);

  useEffect(() => {
    // If variant is explicitly provided, use it
    if (variant !== "circle") {
      setCurrentVariant(variant);
      return;
    }

    // Otherwise, cycle through variants
    const interval = setInterval(() => {
      setCurrentVariant(prev => {
        const variants = ["dots", "wave", "pulse"] as const;
        type VariantType = (typeof variants)[number];
        // Ensure prev is treated as the correct type
        const currentIndex = variants.indexOf(prev as VariantType);
        const nextIndex = (currentIndex + 1) % variants.length;
        return variants[nextIndex];
      });
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [variant]);

  return (
    <div className="flex items-center justify-center min-w-[40px] min-h-[24px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVariant}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}>
          {currentVariant === "dots" && <DotsIndicator />}
          {currentVariant === "wave" && <TypingWave />}
          {currentVariant === "pulse" && <TypingPulse />}
          {currentVariant === "circle" && <CircleIndicator />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DotsIndicator() {
  return (
    <div className="flex space-x-1 rtl:space-x-reverse">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.6,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.15,
          }}
          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500"
        />
      ))}
    </div>
  );
}

function CircleIndicator() {
  return (
    <div className="relative w-8 h-8">
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 opacity-20"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        className="absolute inset-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 opacity-40"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          delay: 0.2,
        }}
      />
      <motion.div
        className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-700 opacity-60"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          delay: 0.4,
        }}
      />
      <motion.div
        className="absolute inset-3 rounded-full bg-gradient-to-r from-purple-700 to-indigo-800"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          delay: 0.6,
        }}
      />
    </div>
  );
}
