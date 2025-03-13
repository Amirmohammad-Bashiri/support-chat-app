"use client";

import { useSupport } from "@/hooks/socket/use-socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AgentChatsPage() {
  const { rooms } = useSupport();
  const router = useRouter();

  const activeRooms = rooms.filter(room => room.isActive && room.agentId);
  const pendingRooms = rooms.filter(room => !room.agentId);

  const handleJoinChat = (roomId: string) => {
    router.push(`/agent/chats/${roomId}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Support Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRooms.length === 0 ? (
            <p>No pending support requests</p>
          ) : (
            <div className="space-y-2">
              {pendingRooms.map(room => (
                <div
                  key={room.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">User: {room.userId}</p>
                    <p className="text-sm text-gray-500">Waiting for agent</p>
                  </div>
                  <Button onClick={() => handleJoinChat(room.id)}>
                    Join Chat
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Chats</CardTitle>
        </CardHeader>
        <CardContent>
          {activeRooms.length === 0 ? (
            <p>No active chats</p>
          ) : (
            <div className="space-y-2">
              {activeRooms.map(room => (
                <div
                  key={room.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">User: {room.userId}</p>
                    <p className="text-sm text-gray-500">Active conversation</p>
                  </div>
                  <Button onClick={() => handleJoinChat(room.id)}>
                    Continue Chat
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
