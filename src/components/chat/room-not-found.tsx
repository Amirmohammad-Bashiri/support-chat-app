"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageSquareOff, ArrowRight, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

interface RoomNotFoundProps {
  message?: string;
  backUrl?: string;
  homeUrl?: string;
}

export function RoomNotFound({
  message = "اتاق گفتگوی مورد نظر یافت نشد",
  backUrl = "/agent/chats",
  homeUrl = "/",
}: RoomNotFoundProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-4 text-center"
      dir="rtl">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-center mb-6">
        <motion.div
          initial={{ rotate: -15 }}
          animate={{ rotate: [0, -15, 0] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 3,
          }}>
          <MessageSquareOff className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        اتاق گفتگو پیدا نشد
      </motion.h1>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-gray-600 mb-8 max-w-md">
        {message}
      </motion.p>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center gap-2 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300">
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت</span>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => router.push(backUrl)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
            بازگشت به لیست گفتگوها
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => router.push(homeUrl)}
            variant="ghost"
            className="flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-700">
            <Home className="h-4 w-4" />
            <span>صفحه اصلی</span>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
