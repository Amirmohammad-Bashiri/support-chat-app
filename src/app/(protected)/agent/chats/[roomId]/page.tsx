"use client";

import { useParams } from "next/navigation";

import { ChatInterface } from "@/components/chat-interface";
import { useAdminOpenedChatRooms } from "@/hooks/use-admin-opened-chat-rooms";

export default function AgentChatRoomPage() {
  const params = useParams();
  const roomId = parseInt(params.roomId as string, 10); // Parse roomId as a number

  const { adminOpenedChatRooms } = useAdminOpenedChatRooms("active");

  const room = adminOpenedChatRooms.find(r => r.id === roomId);

  if (!room) {
    return (
      <div dir="rtl" className="text-right">
        اتاق گفتگو یافت نشد
      </div>
    );
  }

  return (
    <div dir="rtl">
      <ChatInterface room={room} isAgent={true} />
    </div>
  );
}
