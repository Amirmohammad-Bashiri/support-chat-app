"use client";

import { motion } from "framer-motion";
import { Clock, Check, CheckCheck, AlertCircle } from "lucide-react";

type MessageStatus = "pending" | "sending" | "sent" | "read" | "error";

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  className?: string;
}

export function MessageStatusIndicator({
  status,
  className = "",
}: MessageStatusIndicatorProps) {
  // Define the icon and colors based on status
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="h-3 w-3" />,
          color: "text-amber-500",
          tooltip: "در انتظار ارسال",
        };
      case "sending":
        return {
          icon: (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}>
              <Clock className="h-3 w-3" />
            </motion.div>
          ),
          color: "text-amber-600",
          tooltip: "در حال ارسال",
        };
      case "sent":
        return {
          icon: <Check className="h-3 w-3" />,
          color: "text-green-500",
          tooltip: "ارسال شده",
        };
      case "read":
        return {
          icon: <CheckCheck className="h-3 w-3" />,
          color: "text-blue-500",
          tooltip: "خوانده شده",
        };
      case "error":
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          color: "text-red-500",
          tooltip: "خطا در ارسال",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`${config.color} ${className}`} title={config.tooltip}>
      {config.icon}
    </div>
  );
}
