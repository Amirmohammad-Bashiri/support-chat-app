"use client";

import { useRouter } from "next/navigation";
import { useOpenedChatRooms } from "@/hooks/use-opened-chat-rooms";
import { useSocketConnection } from "@/hooks/socket/use-socket";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function UserChatsPage() {
  const router = useRouter();
  const { openedChatRooms, isLoading, isError } = useOpenedChatRooms();
  const { isConnected } = useSocketConnection();

  const handleJoinChat = (roomId: number) => {
    router.push(`/user/chat/${roomId}`);
  };

  if (isLoading) {
    return (
      <main className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>گفتگوهای پشتیبانی شما</CardTitle>
            <CardDescription>
              در حال بارگذاری گفتگوهای فعال شما...
            </CardDescription>
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
            بارگذاری اتاق‌های گفتگو با مشکل مواجه شد. لطفا بعدا دوباره تلاش
            کنید.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>گفتگوهای پشتیبانی شما</CardTitle>
          <CardDescription>
            {!isConnected && (
              <span className="text-red-500 font-medium">
                اتصال قطع شده است. برخی از قابلیت‌ها ممکن است محدود باشند.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {openedChatRooms.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                گفتگوی فعالی وجود ندارد
              </h3>
              <p className="text-gray-500 mt-1">
                شما هیچ گفتگوی پشتیبانی فعالی ندارید.
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push("/user/support")}>
                درخواست پشتیبانی
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {openedChatRooms.map(room => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4 bg-gray-100 rounded-lg  transition-colors">
                  <div>
                    <h3 className="font-medium">{room.name}</h3>
                    <p className="text-sm text-gray-500">
                      {room.agent
                        ? "پشتیبان اختصاص داده شده"
                        : "در انتظار پشتیبان"}
                    </p>
                  </div>
                  <Button onClick={() => handleJoinChat(room.id)}>
                    ورود به گفتگو
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
