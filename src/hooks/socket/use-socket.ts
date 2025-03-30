import { useEffect, useCallback } from "react";

import { useSocketStore, Message, Room } from "@/store/socket-store";
import { useUserStore } from "@/store/user-store";

export const useSocketConnection = () => {
  const { isConnected } = useSocketStore(); // Removed socket event handling
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
    console.log(socket && isConnected && !isAgent);
    if (socket && isConnected && !isAgent) {
      socket.emit("request_support_chat", {});
    }
  }, [socket, isConnected, isAgent]);

  const joinRoom = useCallback(
    (roomId: number) => {
      if (socket && isConnected && isAgent) {
        socket.emit("join_room", roomId);
        setCurrentRoom(roomId);
      }
    },
    [socket, isConnected, setCurrentRoom, isAgent]
  );

  const listenToUserCreatedRoom = useCallback(() => {
    if (socket) {
      socket.on("user_created_room", (room: Room) => {
        console.log("Data received from user_created_room event:", room);
        setCurrentRoom(room.id); // Set the current room
        // socket.emit("join_room", room.id); // Join the user to the room
        // console.log(`Joined room with ID: ${room.id}`);
      });

      return () => {
        socket.off("user_created_room"); // Cleanup listener
      };
    }
  }, [socket, setCurrentRoom]);

  const sendMessage = useCallback(
    (text: string) => {
      if (socket && isConnected && currentRoom && user) {
        const message: Message = {
          id: Date.now(),
          text,
          support_chat_set: currentRoom,
          is_edited: false,
          created_at: new Date().toISOString(),
          created_by: user.id,
          message_type: 1,
          is_deleted: false,
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
      socket.on("room_created", (room: Room) => {
        addRoom(room);
        if (!isAgent && currentRoom !== room.id) {
          setCurrentRoom(room.id);
        }
      });

      socket.on("room_removed", (roomId: number) => {
        removeRoom(roomId);
        if (currentRoom === roomId) {
          setCurrentRoom(null);
        }
      });

      return () => {
        socket.off("room_created");
        socket.off("room_removed");
      };
    }
  }, [socket, addRoom, removeRoom, currentRoom, setCurrentRoom, isAgent]);

  useEffect(() => {
    if (socket) {
      socket.on("room_added", (room: Room) => {
        addRoom(room);
      });

      socket.on("room_updated", (updatedRoom: Room) => {
        updateRoom(updatedRoom.id, updatedRoom);
      });

      socket.on(
        "message_received",
        ({ roomId, message }: { roomId: number; message: Message }) => {
          addMessage(roomId, message);
        }
      );

      socket.on("room_closed", (roomId: number) => {
        removeRoom(roomId);
        if (currentRoom === roomId) {
          setCurrentRoom(null);
        }
      });

      return () => {
        socket.off("room_added");
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
    socket, // Include socket in the return value
    rooms,
    currentRoom,
    setCurrentRoom,
    requestSupport,
    joinRoom,
    sendMessage,
    endConversation,
    listenToUserCreatedRoom, // Expose the listener
  };
};
