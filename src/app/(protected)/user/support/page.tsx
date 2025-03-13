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
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Connect with one of our support agents to get help with your issue.
          </p>
          <Button
            onClick={handleRequestSupport}
            disabled={!!currentRoom}
            className="w-full">
            {currentRoom ? "Support Request Sent" : "Request Support"}
          </Button>

          {currentRoom && (
            <p className="mt-4 text-sm text-green-600">
              Your support request has been sent. You&apos;ll be redirected to
              the chat when an agent connects.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
