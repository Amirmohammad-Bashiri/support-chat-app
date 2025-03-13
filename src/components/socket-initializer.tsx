"use client";

import { useEffect, useRef } from "react";
import io from "socket.io-client";
import { useSocketStore } from "@/store/socket-store";

export function SocketInitializer() {
  const { socket, setSocket } = useSocketStore();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    // Only initialize if we don't have a socket yet and haven't already created one
    if (!socket && !socketRef.current) {
      console.log("Initializing socket connection");
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:85";

      try {
        const newSocket = io(socketUrl, {
          withCredentials: true,
          reconnection: true,
        });

        // Store the socket in our ref first
        socketRef.current = newSocket;

        // Then update the store
        setSocket(newSocket);

        return () => {
          console.log("Cleaning up socket connection");
          if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
          }
        };
      } catch (error) {
        console.error("Error initializing socket:", error);
        socketRef.current = null;
      }
    }
  }, [socket, setSocket]);

  return null;
}
