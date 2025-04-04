"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import { ChatInterface } from "@/components/chat/chat-interface";
import { useSupport } from "@/hooks/socket/use-socket";
import { useAdminOpenedChatRooms } from "@/hooks/use-admin-opened-chat-rooms";

export default function AgentChatRoomPage() {
  const params = useParams();
  const roomId = parseInt(params.roomId as string, 10); // Parse roomId as a number

  const { adminOpenedChatRooms } = useAdminOpenedChatRooms("active");
  const { setCurrentRoom } = useSupport(); // Import setCurrentRoom

  const room = adminOpenedChatRooms.find(r => r.id === roomId);

  useEffect(() => {
    if (roomId && room) {
      setCurrentRoom(roomId); // Set the current room
    }
  }, [room, roomId, setCurrentRoom]);

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
