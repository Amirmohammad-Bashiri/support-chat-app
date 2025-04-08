"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";
import { useSocketStore } from "@/store/socket-store";
import { useMessageQueue } from "@/hooks/use-message-queue";

interface ConnectionStatusProps {
  roomId?: number;
}

// Update the connection status to show for both users and agents
export function ConnectionStatus({ roomId }: ConnectionStatusProps) {
  const { isConnected } = useSocketStore();
  const { getQueueCount, isProcessing } = useMessageQueue();
  const [queueCount, setQueueCount] = useState(0);
  const [showStatus, setShowStatus] = useState(false);
  const [prevConnected, setPrevConnected] = useState(isConnected);

  // Update queue count
  useEffect(() => {
    if (!roomId) return;

    const updateQueueCount = () => {
      setQueueCount(getQueueCount(roomId));
    };

    updateQueueCount();

    // Update count periodically
    const interval = setInterval(updateQueueCount, 2000);
    return () => clearInterval(interval);
  }, [getQueueCount, roomId]);

  // Show status briefly when connection state changes
  useEffect(() => {
    if (prevConnected !== isConnected) {
      setShowStatus(true);
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3000);

      setPrevConnected(isConnected);
      return () => clearTimeout(timer);
    }

    // Also show when processing queue
    if (isProcessing && queueCount > 0) {
      setShowStatus(true);
    } else if (!isProcessing && showStatus) {
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, prevConnected, isProcessing, queueCount, showStatus]);

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg ${
            isConnected
              ? isProcessing && queueCount > 0
                ? "bg-amber-500 text-white"
                : "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}>
          <div className="flex items-center gap-2">
            {isConnected ? (
              isProcessing && queueCount > 0 ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}>
                    <Wifi className="h-4 w-4" />
                  </motion.div>
                  <span className="text-sm font-medium">
                    در حال ارسال {queueCount} پیام...
                  </span>
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm font-medium">اتصال برقرار شد</span>
                </>
              )
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-medium">اتصال قطع شد</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
