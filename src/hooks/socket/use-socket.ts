import { useEffect, useCallback } from "react";

import { useSocketStore, Message, Room } from "@/store/socket-store";
import { useUserStore } from "@/store/user-store"; // Import the useUserStore

export const useSocketConnection = () => {
  const { socket, isConnected, setIsConnected } = useSocketStore();

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => setIsConnected(true));
      socket.on("disconnect", () => setIsConnected(false));

      return () => {
        socket.off("connect");
        socket.off("disconnect");
      };
    }
  }, [socket, setIsConnected]);

  return { isConnected };
};

export const useSupport = () => {
  const {
    socket,
    isConnected,
    isAgent,
    rooms,
    currentRoom,
    setRooms,
    addRoom,
    updateRoom,
    setCurrentRoom,
    addMessage,
    removeRoom,
  } = useSocketStore();
  const { user } = useUserStore();

  const requestSupport = useCallback(() => {
    if (socket && isConnected && !isAgent) {
      socket.emit("request_support");
    }
  }, [socket, isConnected, isAgent]);

  const joinRoom = useCallback(
    (roomId: string) => {
      //  this should be for admin
      if (socket && isConnected && isAgent) {
        socket.emit("join_room", roomId);
        setCurrentRoom(roomId);
      }
    },
    [socket, isConnected, setCurrentRoom, isAgent]
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (socket && isConnected && currentRoom && user) {
        const message: Message = {
          id: Date.now().toString(),
          text,
          senderId: user.id,
          timestamp: new Date(),
        };
        socket.emit("send_message", { roomId: currentRoom, message });
        addMessage(currentRoom, message);
      }
    },
    [socket, isConnected, currentRoom, addMessage, user]
  );

  const endConversation = useCallback(() => {
    if (socket && isConnected && currentRoom && isAgent) {
      socket.emit("end_conversation", currentRoom);
      removeRoom(currentRoom);
      setCurrentRoom(null);
    }
  }, [socket, isConnected, currentRoom, isAgent, removeRoom, setCurrentRoom]);

  useEffect(() => {
    if (socket) {
      // for User
      socket.on("room_created", (room: Room) => {
        addRoom(room);
        if (!isAgent) {
          setCurrentRoom(room.id);
        }
      });

      // for Admin - Add a room to the list
      socket.on("room_added", (room: Room) => {
        addRoom(room);
      });

      // for Admin - Remove a room from the list
      socket.on("room_removed", (roomId: string) => {
        removeRoom(roomId);
        if (currentRoom === roomId) {
          setCurrentRoom(null);
        }
      });

      // This might not be needed anymore as per the comment
      // But keeping it for now in case it's still used elsewhere
      socket.on("room_updated", (updatedRoom: Room) => {
        updateRoom(updatedRoom.id, updatedRoom);
      });

      socket.on(
        "message_received",
        ({ roomId, message }: { roomId: string; message: Message }) => {
          addMessage(roomId, message);
        }
      );

      // This event might be redundant with room_removed, but keeping for backward compatibility
      socket.on("room_closed", (roomId: string) => {
        removeRoom(roomId);
        if (currentRoom === roomId) {
          setCurrentRoom(null);
        }
      });

      return () => {
        socket.off("room_created");
        socket.off("room_added");
        socket.off("room_removed");
        socket.off("room_updated");
        socket.off("message_received");
        socket.off("room_closed");
      };
    }
  }, [
    socket,
    addRoom,
    updateRoom,
    addMessage,
    removeRoom,
    currentRoom,
    setCurrentRoom,
    isAgent,
    setRooms,
  ]);

  return {
    rooms,
    currentRoom,
    requestSupport,
    joinRoom,
    sendMessage,
    endConversation,
  };
};
