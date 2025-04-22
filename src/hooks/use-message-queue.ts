"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { type Message, useSocketStore } from "@/store/socket-store";
import { useUserStore } from "@/store/user-store";

// Extended message interface to include status
export interface ExtendedMessage extends Message {
  isPending?: boolean;
  isSent?: boolean;
  clientId?: string;
}

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

  // Keep track of pending messages in the UI
  const pendingMessagesRef = useRef<Map<string, ExtendedMessage>>(new Map());
  const sentMessagesIdsRef = useRef<Set<number>>(new Set());
  const messageIdsRef = useRef<Set<number | string>>(new Set());

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

  // Add a pending message to the UI
  const addPendingMessage = useCallback(
    (text: string, supportChatSetId: number): string | null => {
      if (!user) return null;

      const clientId = `pending_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const pendingMessage: ExtendedMessage = {
        id: -1 * Date.now(), // Temporary negative ID to avoid conflicts
        text,
        support_chat_set: supportChatSetId,
        is_edited: false,
        created_at: new Date().toISOString(),
        created_by: user.id,
        message_type: 1,
        is_deleted: false,
        is_read: false,
        isPending: true,
        isSent: false,
        sender_first_name: user.first_name,
        sender_last_name: user.last_name,
        clientId,
      };

      // Add to pending messages map
      pendingMessagesRef.current.set(clientId, pendingMessage);

      // Add to message IDs set to prevent duplicates
      messageIdsRef.current.add(pendingMessage.id);

      return clientId;
    },
    [user]
  );

  // Update a pending message status
  const updatePendingMessage = useCallback(
    (
      clientId: string,
      updates: Partial<ExtendedMessage>
    ): ExtendedMessage | undefined => {
      const pendingMessage = pendingMessagesRef.current.get(clientId);
      if (!pendingMessage) return undefined;

      // Update the pending message
      const updatedMessage = { ...pendingMessage, ...updates };
      pendingMessagesRef.current.set(clientId, updatedMessage);

      return updatedMessage;
    },
    []
  );

  // Remove a pending message
  const removePendingMessage = useCallback((clientId: string): void => {
    const pendingMessage = pendingMessagesRef.current.get(clientId);
    if (pendingMessage && pendingMessage.id) {
      messageIdsRef.current.delete(pendingMessage.id);
    }

    pendingMessagesRef.current.delete(clientId);
  }, []);

  // Mark a message as sent
  const markMessageAsSent = useCallback((messageId: number): void => {
    sentMessagesIdsRef.current.add(messageId);

    // Also add to our message IDs set
    messageIdsRef.current.add(messageId);
  }, []);

  // Helper to check if a message already exists
  const messageExists = useCallback((messageId: number | string): boolean => {
    return messageIdsRef.current.has(messageId);
  }, []);

  // Get all pending messages
  const getPendingMessages = useCallback((): ExtendedMessage[] => {
    return Array.from(pendingMessagesRef.current.values());
  }, []);

  // Match a server message to a pending message
  const matchPendingMessageToServer = useCallback(
    (serverMessage: Message): string | null => {
      const pendingMessages = Array.from(pendingMessagesRef.current.values());

      // First try to find an exact match by text
      for (const pendingMsg of pendingMessages) {
        // If there's an exact text match
        if (pendingMsg.text === serverMessage.text) {
          // Make sure they're for the same chat room
          if (pendingMsg.support_chat_set === serverMessage.support_chat_set) {
            console.log(
              `Found exact match for pending message: ${pendingMsg.text}`
            );
            return pendingMsg.clientId || null;
          }
        }
      }

      // If no exact match found, try with more relaxed constraints
      for (const pendingMsg of pendingMessages) {
        // If the text matches and the timestamp is close (within 10 seconds)
        if (pendingMsg.text === serverMessage.text) {
          const pendingTime = new Date(pendingMsg.created_at).getTime();
          const serverTime = new Date(serverMessage.created_at).getTime();

          // If timestamps are within 10 seconds of each other
          if (Math.abs(pendingTime - serverTime) < 10000) {
            console.log(
              `Found timestamp-based match for pending message: ${pendingMsg.text}`
            );
            return pendingMsg.clientId || null;
          }
        }
      }

      return null;
    },
    []
  );

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

          // First, find and remove any UI pending message with matching text
          // This ensures the UI is cleaned up before localStorage
          const pendingMessages = Array.from(
            pendingMessagesRef.current.values()
          );
          for (const pendingMsg of pendingMessages) {
            if (pendingMsg.text === message.text) {
              // Found a match - remove it from the UI references
              const clientId = pendingMsg.clientId;
              if (clientId) {
                console.log(`Cleaning up UI for pending message: ${clientId}`);
                pendingMessagesRef.current.delete(clientId);
                if (pendingMsg.id) {
                  messageIdsRef.current.delete(pendingMsg.id);
                }
              }
              break;
            }
          }

          // Then send the message to the server
          socket.emit(eventName, {
            message: message.text,
            support_chat_set_id: roomId,
          });

          console.log(
            `Sent queued message: ${message.text} (as ${
              isAgent ? "agent" : "user"
            })`
          );

          // Finally, remove the message from localStorage queue
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
    // Queue methods
    queueMessage,
    removeFromQueue,
    getQueueCount,
    getQueuedMessages,
    processQueue,
    clearQueue,
    isMessageInQueue,
    isProcessing,
    // Message status methods
    addPendingMessage,
    updatePendingMessage,
    removePendingMessage,
    getPendingMessages,
    markMessageAsSent,
    messageExists,
    matchPendingMessageToServer,
    // Refs for direct access
    pendingMessagesRef,
    sentMessagesIdsRef,
    messageIdsRef,
  };
}
