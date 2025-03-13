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
    <div className="space-y-6" dir="rtl">
      <Card>
        <CardHeader className="bg-black text-white">
          <CardTitle>داشبورد پشتیبان</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-500">گفتگوهای فعال</h3>
              <p className="text-2xl font-bold text-black">
                {activeRooms.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-500">
                درخواست‌های در انتظار
              </h3>
              <p className="text-2xl font-bold text-black">
                {pendingRooms.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-500">کل گفتگوها</h3>
              <p className="text-2xl font-bold text-black">{rooms.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
