"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WifiOff } from "lucide-react";

import { useSocketStore } from "@/store/socket-store";
import { useMessageQueue } from "@/hooks/use-message-queue";

interface OfflineIndicatorProps {
  roomId: number;
}

export function OfflineIndicator({ roomId }: OfflineIndicatorProps) {
  const { isConnected } = useSocketStore();
  const { getQueueCount } = useMessageQueue();
  const [queueCount, setQueueCount] = useState(0);

  // Update queue count
  useEffect(() => {
    const updateQueueCount = () => {
      setQueueCount(getQueueCount(roomId));
    };

    updateQueueCount();

    // Update count periodically
    const interval = setInterval(updateQueueCount, 2000);
    return () => clearInterval(interval);
  }, [getQueueCount, roomId]);

  // Don't show if connected and no messages in queue
  if (isConnected && queueCount === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="absolute top-2 right-2 z-10">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 0 0 rgba(245, 158, 11, 0.4)",
            "0 0 0 8px rgba(245, 158, 11, 0)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
        }}
        className="flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-full text-xs shadow-md">
        <WifiOff className="h-3 w-3" />
        <span>{!isConnected ? "آفلاین" : "در حال ارسال"}</span>
        {queueCount > 0 && (
          <span className="bg-white text-amber-600 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
            {queueCount}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
