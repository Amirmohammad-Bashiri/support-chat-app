"use client";

import { useEffect, useCallback, useRef } from "react";

import { useSocketStore } from "@/store/socket-store";
import { useUserStore } from "@/store/user-store";

// Interface for queued messages
interface QueuedMessage {
  id: string;
  text: string;
  roomId: number;
  timestamp: number;
  attempts: number;
}

// Simple localStorage-based message queue
export function useMessageQueue() {
  const { socket, isConnected } = useSocketStore();
  const { user } = useUserStore();
  const processingRef = useRef(false);

  // Check if user is an agent (Admin role)
  const isAgent = user?.role_name === "Admin";

  // Helper to get the queue key for a specific room
  const getQueueKey = useCallback((roomId: number) => {
    return `chat_queue_${roomId}`;
  }, []);

  // Get all queued messages for a room
  const getQueuedMessages = useCallback(
    (roomId: number): QueuedMessage[] => {
      try {
        const queueKey = getQueueKey(roomId);
        const queueData = localStorage.getItem(queueKey);
        return queueData ? JSON.parse(queueData) : [];
      } catch (error) {
        console.error("Error getting queued messages:", error);
        return [];
      }
    },
    [getQueueKey]
  );

  // Save queued messages for a room
  const saveQueuedMessages = useCallback(
    (roomId: number, messages: QueuedMessage[]) => {
      try {
        const queueKey = getQueueKey(roomId);
        localStorage.setItem(queueKey, JSON.stringify(messages));
      } catch (error) {
        console.error("Error saving queued messages:", error);
      }
    },
    [getQueueKey]
  );

  // Add a message to the queue
  const queueMessage = useCallback(
    async (text: string, roomId: number) => {
      try {
        // Get current queue
        const messages = getQueuedMessages(roomId);

        // Create new message
        const newMessage: QueuedMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          text,
          roomId,
          timestamp: Date.now(),
          attempts: 0,
        };

        // Add to queue
        messages.push(newMessage);

        // Save updated queue
        saveQueuedMessages(roomId, messages);

        console.log("Message queued for offline sending:", text);
        return true;
      } catch (error) {
        console.error("Failed to queue message:", error);
        return false;
      }
    },
    [getQueuedMessages, saveQueuedMessages]
  );

  // Process the queue for a specific room
  const processRoomQueue = useCallback(
    async (roomId: number) => {
      if (!socket || !isConnected || !user) return 0;

      console.log(`Processing queue for room ${roomId}...`);

      // Get queued messages
      const messages = getQueuedMessages(roomId);
      if (messages.length === 0) return 0;

      console.log(`Found ${messages.length} messages to process`);

      // Track successfully sent messages
      const sentMessageIds: string[] = [];

      // Process each message
      for (const message of messages) {
        try {
          // Increment attempt counter
          message.attempts += 1;

          // Determine which event to use based on user role
          const eventName = isAgent
            ? "agent_send_message"
            : "user_send_message";

          // Send the message
          await new Promise<void>((resolve, reject) => {
            // Set a timeout to prevent hanging
            const timeout = setTimeout(() => {
              reject(new Error("Message sending timed out"));
            }, 5000);

            // Emit the message to the server
            console.log(
              `Sending queued message via ${eventName}:`,
              message.text
            );
            socket.emit(
              eventName,
              {
                message: message.text,
                support_chat_set_id: roomId,
              },
              (response: { success: boolean }) => {
                clearTimeout(timeout);
                if (response?.success) {
                  resolve();
                } else {
                  reject(new Error("Message sending failed"));
                }
              }
            );
          });

          // Mark as sent
          sentMessageIds.push(message.id);
          console.log("Successfully sent queued message:", message.text);
        } catch (error) {
          console.error("Error sending queued message:", error);

          // If too many attempts, give up
          if (message.attempts >= 5) {
            console.error(
              "Giving up on message after 5 attempts:",
              message.text
            );
            sentMessageIds.push(message.id);
          }
        }
      }

      // Remove sent messages from queue
      if (sentMessageIds.length > 0) {
        const remainingMessages = messages.filter(
          msg => !sentMessageIds.includes(msg.id)
        );
        saveQueuedMessages(roomId, remainingMessages);
        console.log(
          `Removed ${sentMessageIds.length} sent messages from queue`
        );
      }

      return sentMessageIds.length;
    },
    [socket, isConnected, user, isAgent, getQueuedMessages, saveQueuedMessages]
  );

  // Process all queues
  const processQueue = useCallback(async () => {
    if (!socket || !isConnected || !user || processingRef.current) return;

    processingRef.current = true;
    console.log("Processing all message queues...");

    try {
      // Get all queue keys
      const queueKeys = Object.keys(localStorage)
        .filter(key => key.startsWith("chat_queue_"))
        .map(key => Number.parseInt(key.replace("chat_queue_", ""), 10))
        .filter(roomId => !isNaN(roomId));

      console.log(`Found ${queueKeys.length} room queues`);

      // Process each room queue
      for (const roomId of queueKeys) {
        await processRoomQueue(roomId);
      }
    } catch (error) {
      console.error("Error processing message queues:", error);
    } finally {
      processingRef.current = false;
    }
  }, [socket, isConnected, user, processRoomQueue]);

  // Get the count of queued messages
  const getQueueCount = useCallback(
    (roomId?: number) => {
      try {
        if (roomId) {
          // Count messages for a specific room
          return getQueuedMessages(roomId).length;
        } else {
          // Count all queued messages
          const queueKeys = Object.keys(localStorage)
            .filter(key => key.startsWith("chat_queue_"))
            .map(key => Number.parseInt(key.replace("chat_queue_", ""), 10))
            .filter(id => !isNaN(id));

          let totalCount = 0;
          for (const id of queueKeys) {
            totalCount += getQueuedMessages(id).length;
          }

          return totalCount;
        }
      } catch (error) {
        console.error("Error getting queue count:", error);
        return 0;
      }
    },
    [getQueuedMessages]
  );

  // Clear the queue for a specific room or all rooms
  const clearQueue = useCallback(
    (roomId?: number) => {
      try {
        if (roomId) {
          // Clear messages for a specific room
          saveQueuedMessages(roomId, []);
        } else {
          // Clear all queues
          const queueKeys = Object.keys(localStorage)
            .filter(key => key.startsWith("chat_queue_"))
            .map(key => Number.parseInt(key.replace("chat_queue_", ""), 10))
            .filter(id => !isNaN(id));

          for (const id of queueKeys) {
            saveQueuedMessages(id, []);
          }
        }

        return true;
      } catch (error) {
        console.error("Error clearing queue:", error);
        return false;
      }
    },
    [saveQueuedMessages]
  );

  // Process the queue when connection is restored
  useEffect(() => {
    if (!socket) return;

    const handleReconnect = () => {
      console.log("Connection restored, processing message queue...");
      // Add a small delay to ensure socket is fully connected
      setTimeout(() => {
        if (socket.connected) {
          processQueue();
        }
      }, 1000);
    };

    // Listen for socket connection events
    socket.on("connect", handleReconnect);

    // Also process queue when component mounts if already connected
    if (isConnected && socket.connected) {
      console.log("Already connected, processing message queue...");
      processQueue();
    }

    return () => {
      socket.off("connect", handleReconnect);
    };
  }, [socket, isConnected, processQueue]);

  return {
    queueMessage,
    processQueue,
    getQueueCount,
    clearQueue,
  };
}
