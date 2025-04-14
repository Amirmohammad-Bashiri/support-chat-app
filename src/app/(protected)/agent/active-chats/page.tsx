"use client";

import { useRouter } from "next/navigation";
import { MessageSquare, AlertCircle, Loader2, Clock, User } from "lucide-react";

import { useAdminOpenedChatRooms } from "@/hooks/use-admin-opened-chat-rooms";
import { useSocketConnection } from "@/hooks/socket/use-socket";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function ActiveChatsPage() {
  const router = useRouter();
  const { adminOpenedChatRooms, isLoading, isError } =
    useAdminOpenedChatRooms("active");
  const { isConnected } = useSocketConnection();

  const handleJoinChat = (roomId: number) => {
    router.push(`/agent/chats/${roomId}`);
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              گفتگوهای پشتیبانی فعال
            </CardTitle>
            <CardDescription>در حال بارگذاری گفتگوهای فعال...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6 sm:py-8">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-500" />
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطا</AlertTitle>
          <AlertDescription>
            بارگذاری گفتگوهای فعال با مشکل مواجه شد. لطفا بعدا دوباره تلاش کنید.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-5xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            گفتگوهای پشتیبانی فعال
          </CardTitle>
          <CardDescription>
            {!isConnected && (
              <span className="text-rose-500 font-medium text-sm sm:text-base">
                اتصال قطع شده است. برخی از قابلیت‌ها ممکن است محدود باشند.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminOpenedChatRooms.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <MessageSquare className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mb-2 sm:mb-3" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                گفتگوی فعالی وجود ندارد
              </h3>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                در حال حاضر هیچ گفتگوی پشتیبانی فعالی وجود ندارد.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {adminOpenedChatRooms.map(room => (
                <div
                  key={room.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3 sm:gap-4">
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="font-medium text-sm sm:text-base">
                        {room.subject}
                      </h3>
                      <Badge className="text-xs py-0.5 px-1.5 bg-green-500">
                        فعال
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1">
                      <Clock className="h-3 w-3 ml-1" />
                      <span className="truncate">
                        شروع گفتگو: {room.agent_joined_at || room.created_at}
                      </span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <User className="h-3 w-3 ml-1" />
                      <span>شناسه کاربر: {room.client}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleJoinChat(room.id)}
                    className="w-full sm:w-auto text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-4 h-auto">
                    ادامه گفتگو
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
