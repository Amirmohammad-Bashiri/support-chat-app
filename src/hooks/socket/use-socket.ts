import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { useSocketStore, Message, Room } from "@/store/socket-store";
import { useUserStore } from "@/store/user-store";

export const useSocketConnection = () => {
  const { isConnected } = useSocketStore();
  return { isConnected };
};

export const useSupport = () => {
  const router = useRouter();

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

  const requestSupport = useCallback(
    (subject: string, description: string) => {
      if (socket && isConnected && !isAgent) {
        socket.emit("request_support_chat", { subject, description });
        router.push("/user/chats");
      }
    },
    [socket, isConnected, isAgent, router]
  );

  const joinRoom = useCallback(
    (roomId: number) => {
      if (socket && isConnected && isAgent) {
        socket.emit("agent_join_support_chat", { support_chat_set_id: roomId });
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
    socket,
    rooms,
    currentRoom,
    setCurrentRoom,
    requestSupport,
    joinRoom,
    sendMessage,
    endConversation,
    listenToUserCreatedRoom,
  };
};
