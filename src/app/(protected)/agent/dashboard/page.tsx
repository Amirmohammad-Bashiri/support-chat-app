"use client";

import { useSupport } from "@/hooks/socket/use-socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AgentDashboardPage() {
  const { rooms } = useSupport();
  const router = useRouter();

  const activeRooms = rooms.filter(room => room.isActive);
  const pendingRooms = rooms.filter(room => !room.agentId);

  const handleJoinChat = (roomId: string) => {
    router.push(`/agent/chats/${roomId}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agent Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium">Active Chats</h3>
              <p className="text-2xl font-bold">{activeRooms.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium">Pending Requests</h3>
              <p className="text-2xl font-bold">{pendingRooms.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium">Total Chats</h3>
              <p className="text-2xl font-bold">{rooms.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
