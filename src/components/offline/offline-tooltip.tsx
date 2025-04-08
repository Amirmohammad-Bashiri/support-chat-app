"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OfflineTooltipProps {
  queueCount: number;
}

export function OfflineTooltip({ queueCount }: OfflineTooltipProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-24 right-4 z-20 max-w-xs bg-white rounded-lg shadow-lg border border-amber-200 overflow-hidden">
        <div className="bg-amber-50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-amber-600" />
            <h3 className="font-medium text-amber-800">قابلیت ارسال آفلاین</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-amber-100"
            onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4 text-amber-600" />
          </Button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            حتی در حالت آفلاین می‌توانید پیام ارسال کنید. پیام‌های شما در دستگاه
            شما ذخیره می‌شوند و به محض اتصال مجدد به اینترنت به صورت خودکار
            ارسال خواهند شد.
          </p>
          {queueCount > 0 && (
            <div className="mt-2 bg-amber-50 p-2 rounded text-sm text-amber-700 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                }}>
                <div className="h-2 w-2 bg-amber-500 rounded-full" />
              </motion.div>
              <span>{queueCount} پیام در صف ارسال</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
