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
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader className="bg-black text-white">
          <CardTitle>درخواست‌های پشتیبانی در انتظار</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {pendingRooms.length === 0 ? (
            <p className="text-gray-500">
              هیچ درخواست پشتیبانی در انتظاری وجود ندارد
            </p>
          ) : (
            <div className="space-y-2">
              {pendingRooms.map(room => (
                <div
                  key={room.id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div>
                    <p className="font-medium text-black">
                      کاربر: {room.userId}
                    </p>
                    <p className="text-sm text-gray-500">در انتظار پشتیبان</p>
                  </div>
                  <Button
                    onClick={() => handleJoinChat(room.id)}
                    className="bg-black hover:bg-black/90 text-white">
                    پیوستن به گفتگو
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-black text-white">
          <CardTitle>گفتگوهای فعال</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {activeRooms.length === 0 ? (
            <p className="text-gray-500">هیچ گفتگوی فعالی وجود ندارد</p>
          ) : (
            <div className="space-y-2">
              {activeRooms.map(room => (
                <div
                  key={room.id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div>
                    <p className="font-medium text-black">
                      کاربر: {room.userId}
                    </p>
                    <p className="text-sm text-gray-500">گفتگوی فعال</p>
                  </div>
                  <Button
                    onClick={() => handleJoinChat(room.id)}
                    className="bg-black hover:bg-black/90 text-white">
                    ادامه گفتگو
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
