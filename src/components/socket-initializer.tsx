"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

import { type Room, useSocketStore } from "@/store/socket-store";
import { useUserStore } from "@/store/user-store";
import { useOpenedChatRooms } from "@/hooks/use-opened-chat-rooms";

export function SocketInitializer() {
  const {
    setSocket,
    setIsConnected,
    setIsAgent,
    setRooms,
    setCurrentRoom,
    currentRoom,
  } = useSocketStore();
  const { user } = useUserStore();
  const { openedChatRooms, isLoading, isError } = useOpenedChatRooms();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const router = useRouter();

  // Initialize the socket connection only once
  useEffect(() => {
    if (socketRef.current) return; // Prevent reinitialization

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
        const isAdmin = user?.role_name === "Admin";
        setIsAgent(isAdmin);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
        setIsAgent(false); // Reset isAgent on disconnect
      });

      // Handle ping-pong events
      newSocket.on("ping", () => {
        console.log("Ping received, sending pong...");
        newSocket.emit("pong", {});
      });

      // Listen for error events
      newSocket.on("error", (error: string) => {
        console.error("Socket error:", error);
      });

      newSocket.on(
        "validation_error",
        (error: { message: string; error_code: number }) => {
          console.error("Validation error:", error);
        }
      );

      newSocket.on("permission_denied", (error: string) => {
        console.error("Permission denied:", error);
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
  }, [setSocket, setIsConnected, setIsAgent, user]);

  // Handle updates to openedChatRooms in a separate effect
  useEffect(() => {
    if (
      user?.role_name !== "Admin" &&
      !isLoading &&
      !isError &&
      openedChatRooms.length > 0 &&
      !currentRoom // Prevent repeated updates
    ) {
      console.log("Processing opened chat rooms:", openedChatRooms);

      // Map OpenedChatRoom to Room
      const rooms = openedChatRooms.map((room: Room) => ({
        ...room,
      }));

      setRooms(rooms); // Update the rooms in the socket store
    }
  }, [
    user?.role_name,
    isLoading,
    isError,
    openedChatRooms,
    currentRoom,
    setRooms,
    setCurrentRoom,
    router,
  ]);

  return null;
}
