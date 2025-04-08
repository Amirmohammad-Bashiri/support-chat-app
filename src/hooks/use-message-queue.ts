"use client";

import { useState, useEffect, useCallback } from "react";
import { type Message, useSocketStore } from "@/store/socket-store";
import { useUserStore } from "@/store/user-store";

// Define the structure of a queued message
interface QueuedMessage {
  id: string;
  text: string;
  roomId: number;
  timestamp: number;
  attempts: number;
}

// Define the structure for the queue storage
interface MessageQueue {
  [roomId: number]: QueuedMessage[];
}

/**
 * Custom hook for handling offline message queue functionality
 */
export function useMessageQueue() {
  const [queue, setQueue] = useState<MessageQueue>({});
  const { socket, isConnected } = useSocketStore();
  const { user } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const savedQueue = localStorage.getItem("message_queue");
      if (savedQueue) {
        setQueue(JSON.parse(savedQueue));
      }
    } catch (error) {
      console.error("Failed to load message queue from localStorage:", error);
      // Reset queue if there's an error
      localStorage.setItem("message_queue", JSON.stringify({}));
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("message_queue", JSON.stringify(queue));
  }, [queue]);

  // Add a message to the queue
  const queueMessage = useCallback(
    async (text: string, roomId: number): Promise<string> => {
      const messageId = `queued_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const newMessage: QueuedMessage = {
        id: messageId,
        text,
        roomId,
        timestamp: Date.now(),
        attempts: 0,
      };

      setQueue(prevQueue => {
        const roomQueue = prevQueue[roomId] || [];
        return {
          ...prevQueue,
          [roomId]: [...roomQueue, newMessage],
        };
      });

      console.log(`Message queued: ${text} for room ${roomId}`);
      return messageId;
    },
    []
  );

  // Remove a message from the queue
  const removeFromQueue = useCallback((roomId: number, messageId: string) => {
    setQueue(prevQueue => {
      const roomQueue = prevQueue[roomId] || [];
      return {
        ...prevQueue,
        [roomId]: roomQueue.filter(msg => msg.id !== messageId),
      };
    });
  }, []);

  // Get the number of queued messages for a specific room
  const getQueueCount = useCallback(
    (roomId: number): number => {
      return queue[roomId]?.length || 0;
    },
    [queue]
  );

  // Get all queued messages
  const getQueuedMessages = useCallback(
    (roomId?: number): QueuedMessage[] => {
      if (roomId !== undefined) {
        return queue[roomId] || [];
      }

      // Return all messages from all rooms if no roomId specified
      return Object.values(queue).flat();
    },
    [queue]
  );

  // Process the queue - send messages if online
  const processQueue = useCallback(() => {
    if (!isConnected || !socket || !user || isProcessing) {
      console.log(
        "Cannot process queue: offline, missing socket/user, or already processing"
      );
      return;
    }

    // Check if there are any messages to process
    const totalMessages = Object.values(queue).flat().length;
    if (totalMessages === 0) {
      return;
    }

    console.log(`Processing message queue (${totalMessages} messages)...`);
    setIsProcessing(true);

    // Check if user is an agent (Admin role)
    const isAgent = user.role_name === "Admin";

    // Process each room's queue
    Object.entries(queue).forEach(([roomIdStr, messages]) => {
      const roomId = Number.parseInt(roomIdStr, 10);

      if (messages.length === 0) return;

      console.log(`Processing ${messages.length} messages for room ${roomId}`);

      // Process messages in order (oldest first)
      const sortedMessages = [...messages].sort(
        (a, b) => a.timestamp - b.timestamp
      );

      // Send each message with appropriate event based on user role
      let processedCount = 0;

      const processNext = () => {
        if (processedCount >= sortedMessages.length) {
          setIsProcessing(false);
          return;
        }

        const message = sortedMessages[processedCount];

        try {
          // Use the appropriate event based on user role
          const eventName = isAgent
            ? "agent_send_message"
            : "user_send_message";

          socket.emit(eventName, {
            message: message.text,
            support_chat_set_id: roomId,
          });

          console.log(
            `Sent queued message: ${message.text} (as ${
              isAgent ? "agent" : "user"
            })`
          );

          // Remove the message from the queue after sending
          removeFromQueue(roomId, message.id);

          // Process next message after a short delay
          processedCount++;
          setTimeout(processNext, 300);
        } catch (error) {
          console.error("Failed to send queued message:", error);

          // Increment attempt count
          setQueue(prevQueue => {
            const roomQueue = prevQueue[roomId] || [];
            return {
              ...prevQueue,
              [roomId]: roomQueue.map(msg =>
                msg.id === message.id
                  ? { ...msg, attempts: msg.attempts + 1 }
                  : msg
              ),
            };
          });

          // Continue with next message
          processedCount++;
          setTimeout(processNext, 300);
        }
      };

      // Start processing
      processNext();
    });
  }, [isConnected, socket, user, queue, removeFromQueue, isProcessing]);

  // Check if a message is in the queue
  const isMessageInQueue = useCallback(
    (messageId: number): boolean => {
      for (const roomMessages of Object.values(queue)) {
        if (roomMessages.some((msg: Message) => msg.id === messageId)) {
          return true;
        }
      }
      return false;
    },
    [queue]
  );

  // Process queue when connection is restored
  useEffect(() => {
    if (isConnected && socket && user && !isProcessing) {
      // Small delay to ensure socket is fully connected
      const timer = setTimeout(() => {
        processQueue();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, socket, user, processQueue, isProcessing]);

  // Clear all queued messages for a room
  const clearQueue = useCallback((roomId?: number) => {
    if (roomId !== undefined) {
      setQueue(prevQueue => {
        const newQueue = { ...prevQueue };
        delete newQueue[roomId];
        return newQueue;
      });
    } else {
      // Clear all queues if no roomId specified
      setQueue({});
    }
  }, []);

  return {
    queueMessage,
    removeFromQueue,
    getQueueCount,
    getQueuedMessages,
    processQueue,
    clearQueue,
    isMessageInQueue,
    isProcessing,
  };
}
