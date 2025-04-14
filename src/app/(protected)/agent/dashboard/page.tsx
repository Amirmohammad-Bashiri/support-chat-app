"use client";

import { useSupport } from "@/hooks/socket/use-socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AgentDashboardPage() {
  const { rooms } = useSupport();

  const activeRooms = rooms.filter(room => room.is_active);
  const pendingRooms = rooms.filter(room => !room.agent);

  return (
    <div className="p-2 sm:p-4 space-y-4" dir="rtl">
      <Card className="shadow-sm">
        <CardHeader className="bg-black text-white p-3">
          <CardTitle className="text-sm sm:text-base">
            داشبورد پشتیبان
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-500 text-xs sm:text-sm">
                گفتگوهای فعال
              </h3>
              <p className="text-xl font-bold text-black">
                {activeRooms.length}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-500 text-xs sm:text-sm">
                درخواست‌های در انتظار
              </h3>
              <p className="text-xl font-bold text-black">
                {pendingRooms.length}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-500 text-xs sm:text-sm">
                کل گفتگوها
              </h3>
              <p className="text-xl font-bold text-black">{rooms.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* <Card className="shadow-sm">
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
      </Card> */}
    </div>
  );
}
