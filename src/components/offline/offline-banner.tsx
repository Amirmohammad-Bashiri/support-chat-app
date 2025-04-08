"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessageQueue } from "@/hooks/use-message-queue";
import { useSocketStore } from "@/store/socket-store";

interface OfflineBannerProps {
  roomId: number;
}

export function OfflineBanner({ roomId }: OfflineBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const { isConnected } = useSocketStore();
  const { getQueueCount, getQueuedMessages } = useMessageQueue();

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

  // If connected and no messages in queue, don't show banner
  if (isConnected && queueCount === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="mb-4 bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
        <div className="p-3">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 bg-amber-100 p-2 rounded-full">
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(217, 119, 6, 0.4)",
                    "0 0 0 10px rgba(217, 119, 6, 0)",
                    "0 0 0 0 rgba(217, 119, 6, 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="relative">
                <WifiOff className="h-5 w-5 text-amber-600" />
              </motion.div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-amber-800">
                {!isConnected
                  ? "حالت آفلاین فعال است"
                  : "در حال ارسال پیام‌های ذخیره شده"}
              </p>
              <p className="text-amber-700 text-xs mt-1">
                {!isConnected
                  ? "پیام‌های شما در دستگاه شما ذخیره می‌شوند و به محض اتصال مجدد به اینترنت به صورت خودکار ارسال خواهند شد."
                  : "اتصال شما برقرار شده است. پیام‌های ذخیره شده در حال ارسال هستند."}
                {queueCount > 0 && ` (${queueCount} پیام در صف ارسال)`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 p-1 h-auto"
              onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && queueCount > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-amber-200 bg-amber-50/50">
              <div className="p-3 max-h-40 overflow-y-auto">
                <h4 className="text-xs font-medium text-amber-800 mb-2">
                  پیام‌های در صف ارسال:
                </h4>
                <div className="space-y-2">
                  {getQueuedMessages(roomId).map(message => (
                    <div
                      key={message.id}
                      className="bg-white rounded p-2 text-xs border border-amber-100 flex items-center gap-2">
                      <Clock className="h-3 w-3 text-amber-500 flex-shrink-0" />
                      <p className="flex-1 truncate text-gray-700">
                        {message.text}
                      </p>
                      <span className="text-amber-600 text-[10px]">
                        {new Date(message.timestamp).toLocaleTimeString(
                          "fa-IR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
