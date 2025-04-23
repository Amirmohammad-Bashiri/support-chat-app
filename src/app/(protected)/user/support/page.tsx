"use client";

import { useState } from "react";
import { useSupport } from "@/hooks/socket/use-socket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

export default function SupportPage() {
  const { requestSupport } = useSupport();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{ success: boolean } | null>(null);

  const handleRequestSupport = async () => {
    if (subject && description) {
      setIsLoading(true);
      const res = await requestSupport(subject, description);
      setResponse(res);
      setIsLoading(false);
    }
  };

  console.log("isLoading--------------------->", isLoading);

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
            disabled={isLoading}
          />
          <Textarea
            placeholder="توضیحات"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="mb-4"
            disabled={isLoading}
          />
          <Button
            onClick={handleRequestSupport}
            disabled={!subject || !description || isLoading}
            className="w-full">
            {isLoading ? <Spinner /> : "درخواست پشتیبانی"}
          </Button>
          {response && (
            <p
              className={`mt-4 text-sm text-right ${
                response.success ? "text-green-600" : "text-red-600"
              }`}>
              {response.success
                ? "درخواست پشتیبانی شما با موفقیت ارسال شد."
                : "ارسال درخواست پشتیبانی با مشکل مواجه شد."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
