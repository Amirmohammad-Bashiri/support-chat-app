"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useSupport } from "@/hooks/socket/use-socket";
import { ChatInterface } from "@/components/chat-interface";

import type { Room } from "@/store/socket-store";

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = parseInt(params.roomId as string, 10); // Parse roomId as a number
  const { rooms, currentRoom, setCurrentRoom } = useSupport();
  const [room, setRoom] = useState<Room | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (rooms.length === 0) {
      return; // Wait until rooms are populated
    }

    const foundRoom = rooms.find(r => r.id === roomId) ?? null;
    setRoom(foundRoom);

    if (!foundRoom) {
      router.replace("/user/support");
      return;
    }

    if (roomId && roomId !== currentRoom) {
      setCurrentRoom(roomId);
    }
  }, [roomId, rooms, currentRoom, setCurrentRoom, router]);

  if (!room && rooms.length === 0) {
    return null; // Render nothing while waiting for rooms to populate
  }

  if (!room) {
    return null; // Render nothing if no valid room is found
  }

  return (
    <div dir="rtl">
      <ChatInterface room={room} />
    </div>
  );
}
