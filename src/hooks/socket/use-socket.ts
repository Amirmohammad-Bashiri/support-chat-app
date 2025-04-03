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
        if (isAgent) {
          socket.emit("agent_send_message", {
            message: text,
            support_chat_set_id: currentRoom,
          });
        } else {
          console.log("CALLED", currentRoom, text);
          socket.emit("user_send_message", {
            message: text,
            support_chat_set_id: currentRoom,
          });
        }
      }
    },
    [socket, isConnected, currentRoom, user, isAgent]
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

      socket.on("room_closed", (roomId: number) => {
        removeRoom(roomId);
        if (currentRoom === roomId) {
          setCurrentRoom(null);
        }
      });

      return () => {
        socket.off("room_added");
        socket.off("room_updated");
        socket.off("room_closed");
      };
    }
  }, [
    socket,
    addRoom,
    updateRoom,
    removeRoom,
    currentRoom,
    setCurrentRoom,
    isAgent,
    setRooms,
  ]);

  useEffect(() => {
    if (socket) {
      // Listen for user_message event
      socket.on(
        "user_message",
        ({
          support_chat_set_id,
          message,
        }: {
          support_chat_set_id: number;
          message: Message;
        }) => {
          console.log(
            `New user message for room ${support_chat_set_id}:`,
            message
          );
        }
      );

      // Listen for agent_message event
      socket.on(
        "agent_message",
        ({
          support_chat_set_id,
          message,
        }: {
          support_chat_set_id: number;
          message: Message;
        }) => {
          console.log(
            `New agent message for room ${support_chat_set_id}:`,
            message
          );
        }
      );

      return () => {
        socket.off("user_message");
        socket.off("agent_message");
      };
    }
  }, [socket]);

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
