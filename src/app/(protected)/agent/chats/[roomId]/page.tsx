"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useSupport } from "@/hooks/socket/use-socket";
import { ChatInterface } from "@/components/chat-interface";

export default function AgentChatRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { rooms, currentRoom, joinRoom } = useSupport();

  useEffect(() => {
    if (roomId && roomId !== currentRoom) {
      joinRoom(roomId);
    }
  }, [roomId, currentRoom, joinRoom]);

  const room = rooms.find(r => r.id === roomId);

  if (!room) {
    return <div>Chat room not found</div>;
  }

  return <ChatInterface room={room} isAgent={true} />;
}
