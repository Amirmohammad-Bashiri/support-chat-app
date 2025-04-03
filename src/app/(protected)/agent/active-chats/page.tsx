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
      <main className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>گفتگوهای پشتیبانی فعال</CardTitle>
            <CardDescription>در حال بارگذاری گفتگوهای فعال...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="container mx-auto py-6">
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
    <main className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>گفتگوهای پشتیبانی فعال</CardTitle>
          <CardDescription>
            {!isConnected && (
              <span className="text-rose-500 font-medium">
                اتصال قطع شده است. برخی از قابلیت‌ها ممکن است محدود باشند.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminOpenedChatRooms.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                گفتگوی فعالی وجود ندارد
              </h3>
              <p className="text-gray-500 mt-1">
                در حال حاضر هیچ گفتگوی پشتیبانی فعالی وجود ندارد.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {adminOpenedChatRooms.map(room => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">{room.subject}</h3>
                      <Badge className="mr-2 bg-green-500">فعال</Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-3 w-3 ml-1" />
                      <span>
                        شروع گفتگو: {room.agent_joined_at || room.created_at}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-3 w-3 ml-1" />
                      <span>شناسه کاربر: {room.client}</span>
                    </div>
                  </div>
                  <Button onClick={() => handleJoinChat(room.id)}>
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
