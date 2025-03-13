"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";
import { useSocketConnection } from "@/hooks/socket/use-socket";
import { useSocketStore } from "@/store/socket-store";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const { isConnected } = useSocketConnection();
  const { socket } = useSocketStore();

  useEffect(() => {
    if (user && !isLoading) {
      // Redirect based on user role
      if (user.role_name === "Admin") {
        router.push("/agent/dashboard");
      } else {
        router.push("/user/support");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

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
              <AlertDescription>Your connection is active.</AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-50 border-red-200 text-red-800">
              <XCircle className="h-4 w-4 text-red-500" />
              <AlertTitle>Socket is disconnected</AlertTitle>
              <AlertDescription>
                There seems to be an issue with your socket connection.
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
