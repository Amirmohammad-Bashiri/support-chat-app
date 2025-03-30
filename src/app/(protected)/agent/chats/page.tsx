"use client";

import { useSupport } from "@/hooks/socket/use-socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AgentChatsPage() {
  const { rooms } = useSupport();
  const router = useRouter();

  const activeRooms = rooms.filter(room => room.is_active && room.agent);
  const pendingRooms = rooms.filter(room => !room.agent);

  const handleJoinChat = (roomId: number) => {
    router.push(`/agent/chats/${roomId}`);
  };

  return (
    <div className="p-2 sm:p-4 space-y-4" dir="rtl">
      <Card className="shadow-sm">
        <CardHeader className="bg-black text-white p-3">
          <CardTitle className="text-sm sm:text-base">
            درخواست‌های پشتیبانی در انتظار
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {pendingRooms.length === 0 ? (
            <p className="text-gray-500 text-sm">
              هیچ درخواست پشتیبانی در انتظاری وجود ندارد
            </p>
          ) : (
            <div className="space-y-2">
              {pendingRooms.map(room => (
                <div
                  key={room.id}
                  className="flex flex-col gap-2 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div>
                    <p className="font-medium text-black text-sm">
                      کاربر: {room.client}
                    </p>
                    <p className="text-xs text-gray-500">در انتظار پشتیبان</p>
                  </div>
                  <Button
                    onClick={() => handleJoinChat(room.id)}
                    className="bg-black hover:bg-black/90 text-white text-xs w-full">
                    پیوستن به گفتگو
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="bg-black text-white p-3">
          <CardTitle className="text-sm sm:text-base">گفتگوهای فعال</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {activeRooms.length === 0 ? (
            <p className="text-gray-500 text-sm">هیچ گفتگوی فعالی وجود ندارد</p>
          ) : (
            <div className="space-y-2">
              {activeRooms.map(room => (
                <div
                  key={room.id}
                  className="flex flex-col gap-2 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div>
                    <p className="font-medium text-black text-sm">
                      کاربر: {room.client}
                    </p>
                    <p className="text-xs text-gray-500">گفتگوی فعال</p>
                  </div>
                  <Button
                    onClick={() => handleJoinChat(room.id)}
                    className="bg-black hover:bg-black/90 text-white text-xs w-full">
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
