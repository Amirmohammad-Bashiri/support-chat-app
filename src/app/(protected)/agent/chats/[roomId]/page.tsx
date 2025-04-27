"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import { ChatInterface } from "@/components/chat/chat-interface";
import { useSupport } from "@/hooks/socket/use-socket";
import { useAdminOpenedChatRooms } from "@/hooks/use-admin-opened-chat-rooms";
import { Spinner } from "@/components/ui/spinner";
import { RoomNotFound } from "@/components/chat/room-not-found";

export default function AgentChatRoomPage() {
  const params = useParams();
  const roomId = parseInt(params.roomId as string, 10);

  const { adminOpenedChatRooms, isLoading } = useAdminOpenedChatRooms("active");
  const { setCurrentRoom } = useSupport();

  const room = adminOpenedChatRooms.find(r => r.id === roomId);

  useEffect(() => {
    if (adminOpenedChatRooms.length === 0 && isLoading) {
      return; // Wait for rooms to get populated
    }

    if (roomId && room) {
      setCurrentRoom(roomId); // Set the current room
    }
  }, [room, roomId, setCurrentRoom, adminOpenedChatRooms, isLoading]);

  if (!room && isLoading) {
    return <Spinner />;
  }

  if (!room) {
    return <RoomNotFound homeUrl="/agent/dashboard" />;
  }

  return (
    <div dir="rtl">
      <ChatInterface room={room} isAgent={true} />
    </div>
  );
}
