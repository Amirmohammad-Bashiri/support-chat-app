"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { useSupport } from "@/hooks/socket/use-socket";
import { ChatInterface } from "@/components/chat-interface";

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = parseInt(params.roomId as string, 10); // Parse roomId as a number
  const { rooms, currentRoom, setCurrentRoom } = useSupport();
  const router = useRouter();

  useEffect(() => {
    if (roomId && roomId !== currentRoom) {
      setCurrentRoom(roomId);
    }
  }, [roomId, currentRoom, setCurrentRoom]);

  const room = rooms.find(r => r.id === roomId);

  if (!room) {
    return router.replace("/user/support");
  }

  return (
    <div dir="rtl">
      <ChatInterface room={room} />
    </div>
  );
}
