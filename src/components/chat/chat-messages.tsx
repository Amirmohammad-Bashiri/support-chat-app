import { useUserStore } from "@/store/user-store"; // Import user-store
import type { Room, Message } from "@/store/socket-store";

interface ChatMessagesProps {
  messages: Message[];
  room: Room;
}

export function ChatMessages({ messages, room }: ChatMessagesProps) {
  const { user } = useUserStore(); // Access the current user

  const uniqueMessages = Array.from(
    new Map(messages.map(msg => [msg.id, msg])).values()
  );

  return (
    <div className="space-y-4">
      {uniqueMessages.map(msg => {
        const isCurrentUser = msg.created_by === room.client;
        const isSentByCurrentUser = msg.created_by === user?.id; // Check if the message was sent by the current user

        return (
          <div
            key={msg.id}
            className={`flex ${
              isCurrentUser ? "justify-start" : "justify-end"
            }`}>
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                isCurrentUser
                  ? "bg-black text-white"
                  : "bg-white text-black shadow border border-gray-200"
              }`}>
              <p>{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.created_at).toLocaleTimeString()}
              </p>
              {msg.is_read &&
                isSentByCurrentUser && ( // Show "is_read" only for messages sent by the current user
                  <p className="text-xs text-green-500 mt-1">خوانده شده</p>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
