"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import { useSupport } from "@/hooks/socket/use-socket";
import { ChatInterface } from "@/components/chat-interface";

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { rooms, currentRoom, setCurrentRoom } = useSupport();

  useEffect(() => {
    if (roomId && roomId !== currentRoom) {
      setCurrentRoom(roomId);
    }
  }, [roomId, currentRoom, setCurrentRoom]);

  const room = rooms.find(r => r.id === roomId);

  if (!room) {
    return (
      <div dir="rtl" className="text-right">
        اتاق گفتگو یافت نشد
      </div>
    );
  }

  return (
    <div dir="rtl">
      <ChatInterface room={room} />
    </div>
  );
}
