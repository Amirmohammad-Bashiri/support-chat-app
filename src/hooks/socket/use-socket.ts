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

  const requestSupport = async (subject: string, description: string) => {
    if (socket && isConnected && !isAgent) {
      try {
        const response = await socket.emitWithAck("request_support_chat", {
          subject,
          description,
        });
        console.log("Support request response:", response);
        if (response.success) {
          console.log("Support request was successful.");
        } else {
          console.log("Support request failed:", response);
        }
        return response;
      } catch (error) {
        console.error("Error requesting support:", error);
        return { success: false, error };
      }
    }
    return { success: false, error: "Not connected or not a user" };
  };

  const joinRoom = useCallback(
    async (roomId: number) => {
      if (socket && isConnected && isAgent) {
        await socket.emitWithAck("agent_join_support_chat", {
          support_chat_set_id: roomId,
        });
        setCurrentRoom(roomId);
      }
    },
    [socket, isConnected, setCurrentRoom, isAgent]
  );

  const listenToUserCreatedRoom = useCallback(() => {
    if (socket && user) {
      socket.on("user_created_room", (room: Room) => {
        if (user.role_name === "Business Unit Owner") {
          setCurrentRoom(room.id);
          router.push(`/user/chat/${room.id}`);
        }
      });

      return () => {
        socket.off("user_created_room");
      };
    }
  }, [socket, user, setCurrentRoom, router]);

  const sendMessage = useCallback(
    (text: string) => {
      if (socket && isConnected && currentRoom && user) {
        if (isAgent) {
          socket.emit("agent_send_message", {
            message: text,
            support_chat_set_id: currentRoom,
          });
        } else {
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
    if (socket && isConnected && currentRoom) {
      // Use the correct event name with the correct payload format
      socket.emit("close_support_chat", { support_chat_set_id: currentRoom });

      // For agents, we'll let the room_closed event handler handle removal
      // No need to immediately remove the room here
    }
  }, [socket, isConnected, currentRoom]);

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

      socket.on("room_closed", (room: Room) => {
        console.log("Room closed:", room);
        removeRoom(room.id);
        if (currentRoom === room.id) {
          setCurrentRoom(null);

          // Redirect based on user role
          if (isAgent) {
            router.push("/agent/dashboard");
          } else {
            router.push("/user/support");
          }
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
    router,
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
