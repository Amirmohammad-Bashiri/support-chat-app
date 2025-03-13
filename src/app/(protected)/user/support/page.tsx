"use client";

import { useSupport } from "@/hooks/socket/use-socket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupportPage() {
  const { requestSupport, currentRoom } = useSupport();

  const handleRequestSupport = () => {
    if (!currentRoom) {
      requestSupport();
    }
  };

  return (
    <div className="max-w-md mx-auto" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>نیاز به کمک دارید؟</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-right">
            برای حل مشکل خود با یکی از پشتیبان‌های ما ارتباط برقرار کنید.
          </p>
          <Button
            onClick={handleRequestSupport}
            disabled={!!currentRoom}
            className="w-full">
            {currentRoom ? "درخواست پشتیبانی ارسال شد" : "درخواست پشتیبانی"}
          </Button>

          {currentRoom && (
            <p className="mt-4 text-sm text-green-600 text-right">
              درخواست پشتیبانی شما ارسال شده است. به محض اتصال پشتیبان، به صفحه
              گفتگو هدایت خواهید شد.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
