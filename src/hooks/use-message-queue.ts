"use client";

import { useEffect, useCallback } from "react";
import { openDB, type IDBPDatabase } from "idb";
import { useSocketStore } from "@/store/socket-store";
import { useUserStore } from "@/store/user-store";

// Database name and store
const DB_NAME = "chat-message-queue";
const STORE_NAME = "pending-messages";

// Interface for messages stored in IndexedDB
interface StoredMessage {
  id: string; // Client-generated ID
  text: string;
  supportChatSetId: number;
  timestamp: number;
  attempts: number;
}

// Initialize the database
const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      // Create the store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        // Create an index for the support chat set ID for faster queries
        store.createIndex("supportChatSetId", "supportChatSetId");
        // Create an index for timestamp to process messages in order
        store.createIndex("timestamp", "timestamp");
      }
    },
  });
};

export function useMessageQueue() {
  const { socket, isConnected } = useSocketStore();
  const { user } = useUserStore();

  // Check if user is an agent (Admin role)
  const isAgent = user?.role_name === "Admin";

  // Add a message to the queue
  const queueMessage = useCallback(
    async (text: string, supportChatSetId: number) => {
      try {
        const db = await initDB();
        const id = `msg_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 9)}`;

        const storedMessage: StoredMessage = {
          id,
          text,
          supportChatSetId,
          timestamp: Date.now(),
          attempts: 0,
        };

        await db.add(STORE_NAME, storedMessage);

        console.log("Message queued for offline sending:", text);
        return true;
      } catch (error) {
        console.error("Failed to queue message:", error);
        return false;
      }
    },
    []
  );

  // Process the queue when connection is restored
  const processQueue = useCallback(async () => {
    if (!socket || !isConnected || !user) return;

    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      // Get all messages sorted by timestamp
      const messages = (await store
        .index("timestamp")
        .getAll()) as StoredMessage[];

      console.log(`Processing ${messages.length} queued messages`);

      // Process each message
      for (const message of messages) {
        try {
          // Increment attempt counter
          message.attempts += 1;

          // Determine which event to use based on user role
          const eventName = isAgent
            ? "agent_send_message"
            : "user_send_message";

          // Emit the message to the server
          socket.emit(eventName, {
            message: message.text,
            support_chat_set_id: message.supportChatSetId,
          });

          // If successful, remove from queue
          await store.delete(message.id);
          console.log("Successfully sent queued message:", message.text);
        } catch {
          // If failed, update the attempt counter
          if (message.attempts < 5) {
            await store.put(message);
            console.log(
              `Failed to send message, attempt ${message.attempts}/5`
            );
          } else {
            // If too many attempts, remove from queue
            await store.delete(message.id);
            console.error(
              "Giving up on message after 5 attempts:",
              message.text
            );
          }
        }
      }

      await tx.done;
    } catch (error) {
      console.error("Error processing message queue:", error);
    }
  }, [socket, isConnected, user, isAgent]);

  // Get the count of queued messages
  const getQueueCount = useCallback(async (supportChatSetId?: number) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);

      if (supportChatSetId) {
        // Count messages for a specific chat
        const index = store.index("supportChatSetId");
        const keys = await index.getAllKeys(IDBKeyRange.only(supportChatSetId));
        return keys.length;
      } else {
        // Count all messages
        return await store.count();
      }
    } catch (countError) {
      console.error("Error getting queue count:", countError);
      return 0;
    }
  }, []);

  // Clear the queue for a specific chat or all chats
  const clearQueue = useCallback(async (supportChatSetId?: number) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      if (supportChatSetId) {
        // Clear messages for a specific chat
        const index = store.index("supportChatSetId");
        const keys = await index.getAllKeys(IDBKeyRange.only(supportChatSetId));
        for (const key of keys) {
          await store.delete(key);
        }
      } else {
        // Clear all messages
        await store.clear();
      }

      await tx.done;
      return true;
    } catch (clearError) {
      console.error("Error clearing queue:", clearError);
      return false;
    }
  }, []);

  // Process the queue when connection is restored
  useEffect(() => {
    if (socket && isConnected) {
      const handleReconnect = () => {
        console.log("Connection restored, processing message queue...");
        processQueue();
      };

      socket.on("connect", handleReconnect);

      // Also process queue on initial connection
      processQueue();

      return () => {
        socket.off("connect", handleReconnect);
      };
    }
  }, [socket, isConnected, processQueue]);

  return {
    queueMessage,
    processQueue,
    getQueueCount,
    clearQueue,
  };
}
