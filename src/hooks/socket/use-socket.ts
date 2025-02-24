import { useEffect, useCallback } from "react";

import { useSocketStore, Message, Room } from "@/store/socket-store";

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

  const requestSupport = useCallback(() => {
    if (socket && isConnected && !isAgent) {
      socket.emit("request_support");
    }
  }, [socket, isConnected, isAgent]);

  const joinRoom = useCallback(
    (roomId: string) => {
      if (socket && isConnected) {
        socket.emit("join_room", roomId);
        setCurrentRoom(roomId);
      }
    },
    [socket, isConnected, setCurrentRoom]
  );

  const sendMessage = useCallback(
    (text: string) => {
      if (socket && isConnected && currentRoom) {
        const message: Message = {
          id: Date.now().toString(),
          text,
          senderId: socket.id || "user",
          timestamp: new Date(),
        };
        socket.emit("send_message", { roomId: currentRoom, message });
        addMessage(currentRoom, message);
      }
    },
    [socket, isConnected, currentRoom, addMessage]
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
      socket.on("room_created", (room: Room) => {
        addRoom(room);
        if (!isAgent) {
          setCurrentRoom(room.id);
        }
      });

      socket.on("rooms_update", (updatedRooms: Room[]) => {
        setRooms(updatedRooms);
      });

      socket.on("room_updated", (updatedRoom: Room) => {
        updateRoom(updatedRoom.id, updatedRoom);
      });

      socket.on(
        "message_received",
        ({ roomId, message }: { roomId: string; message: Message }) => {
          addMessage(roomId, message);
        }
      );

      socket.on("room_closed", (roomId: string) => {
        removeRoom(roomId);
        if (currentRoom === roomId) {
          setCurrentRoom(null);
        }
      });

      return () => {
        socket.off("room_created");
        socket.off("rooms_update");
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
