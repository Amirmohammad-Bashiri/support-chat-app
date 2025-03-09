"use client";

import { useEffect } from "react";
import io from "socket.io-client";
import { useSocketStore } from "@/store/socket-store";

export function SocketInitializer() {
  const { setSocket } = useSocketStore();

  useEffect(() => {
    console.log("Initializing socket connection");
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8001";

    try {
      const socket = io(socketUrl, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      setSocket(socket);

      return () => {
        console.log("Cleaning up socket connection");
        socket.disconnect();
        setSocket(null);
      };
    } catch (error) {
      console.error("Error initializing socket:", error);
    }
  }, [setSocket]);

  // This component doesn't render anything visible
  return null;
}
