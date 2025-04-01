"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import { useSupport } from "@/hooks/socket/use-socket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function SupportPage() {
  const { requestSupport, currentRoom } = useSupport();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  // const router = useRouter();

  const handleRequestSupport = () => {
    if (subject && description) {
      console.log("Requesting support chat...");
      requestSupport(subject, description);
    }
  };

  // useEffect(() => {
  //   const cleanup = listenToUserCreatedRoom(); // Start listening to the event
  //   return cleanup; // Cleanup listener on unmount
  // }, [listenToUserCreatedRoom]);

  console.log(currentRoom);

  // useEffect(() => {
  //   if (currentRoom) {
  //     router.push(`/user/chat/${currentRoom}`);
  //   }
  // }, [currentRoom, router]);

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
          <Input
            placeholder="موضوع"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="mb-4"
          />
          <Textarea
            placeholder="توضیحات"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="mb-4"
          />
          <Button
            onClick={handleRequestSupport}
            disabled={!subject || !description}
            className="w-full">
            درخواست پشتیبانی
            {/* {currentRoom ? "درخواست پشتیبانی ارسال شد" : "درخواست پشتیبانی"} */}
          </Button>

          {/* {currentRoom && (
            <p className="mt-4 text-sm text-green-600 text-right">
              درخواست پشتیبانی شما ارسال شده است. به محض اتصال پشتیبان، به صفحه
              گفتگو هدایت خواهید شد.
            </p>
          )} */}
        </CardContent>
      </Card>
    </div>
  );
}
