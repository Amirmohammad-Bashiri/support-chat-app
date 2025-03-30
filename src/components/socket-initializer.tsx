"use client";

import { useEffect, useRef } from "react";
import io from "socket.io-client";
import { useSocketStore } from "@/store/socket-store";
import { useUserStore } from "@/store/user-store";

export function SocketInitializer() {
  const { setSocket, setIsConnected, setIsAgent } = useSocketStore();
  const { user } = useUserStore(); // Access the user from the user store
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:85";

      try {
        const newSocket = io(`${socketUrl}/support-chat`, {
          withCredentials: true,
          reconnection: true,
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Handle connection events
        newSocket.on("connect", () => {
          console.log("Socket connected:", newSocket.id);
          setIsConnected(true);

          // Set isAgent based on the user's role
          if (user?.role_name === "Admin") {
            setIsAgent(true);
          } else {
            setIsAgent(false);
          }
        });

        newSocket.on("disconnect", () => {
          console.log("Socket disconnected");
          setIsConnected(false);
          setIsAgent(false); // Reset isAgent on disconnect
        });

        // Handle ping-pong events
        newSocket.on("ping", () => {
          console.log("Ping received, sending pong...");
          newSocket.emit("pong");
        });

        // Cleanup on unmount
        return () => {
          if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
            setIsConnected(false);
            setIsAgent(false);
          }
        };
      } catch (error) {
        console.error("Error initializing socket:", error);
        socketRef.current = null;
      }
    }
  }, [setSocket, setIsConnected, setIsAgent, user]); // Added user to dependencies

  return null;
}
