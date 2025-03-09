// app/page.tsx
"use client";

import { useEffect, useState } from "react";

import { useSocketStore } from "@/store/socket-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";
import { useSocketConnection } from "@/hooks/socket/use-socket";

export default function HomePage() {
  const { isConnected } = useSocketConnection();
  const { socket } = useSocketStore();
  const [lastPingTime, setLastPingTime] = useState<Date | null>(null);
  const [pingCount, setPingCount] = useState(0);

  // Track ping events
  useEffect(() => {
    if (socket) {
      const handlePing = () => {
        console.log("Ping received, sending pong");
        setLastPingTime(new Date());
        setPingCount(prev => prev + 1);
      };

      socket.on("ping", handlePing);

      return () => {
        socket.off("ping", handlePing);
      };
    }
  }, [socket]);

  return (
    <main className="min-h-dvh bg-gray-100 p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Socket Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Socket is connected!</AlertTitle>
              <AlertDescription>
                Your connection is active.
                {lastPingTime && (
                  <div className="mt-2 text-sm text-gray-500">
                    Last ping: {lastPingTime.toLocaleTimeString()}
                    <br />
                    Total pings: {pingCount}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <XCircle className="h-4 w-4 text-red-500" />
              <AlertTitle>Socket is disconnected</AlertTitle>
              <AlertDescription>
                There seems to be an issue with your socket connection.
                <div className="mt-2 text-sm">
                  <p>Troubleshooting steps:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Check if your server is running</li>
                    <li>Ensure CORS is properly configured on your server</li>
                    <li>Check browser console for errors</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Socket Debug Info</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Socket ID:</span>{" "}
                {socket?.id || "Not available"}
              </p>
              <p>
                <span className="font-medium">Connected:</span>{" "}
                {isConnected ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-medium">Socket Instance:</span>{" "}
                {socket ? "Created" : "Not created"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
