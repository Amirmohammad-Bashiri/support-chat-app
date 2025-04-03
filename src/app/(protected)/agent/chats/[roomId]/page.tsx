"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useSupport } from "@/hooks/socket/use-socket";
import { ChatInterface } from "@/components/chat-interface";
import { useAdminOpenedChatRooms } from "@/hooks/use-admin-opened-chat-rooms";

export default function AgentChatRoomPage() {
  const params = useParams();
  const roomId = parseInt(params.roomId as string, 10); // Parse roomId as a number
  const { currentRoom, joinRoom } = useSupport();

  const { adminOpenedChatRooms } = useAdminOpenedChatRooms("active");

  useEffect(() => {
    if (roomId && roomId !== currentRoom) {
      joinRoom(roomId);
    }
  }, [roomId, currentRoom, joinRoom]);

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
