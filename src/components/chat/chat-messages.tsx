import { useUserStore } from "@/store/user-store";
import type { Room, Message } from "@/store/socket-store";

interface ChatMessagesProps {
  messages: Message[];
  room: Room;
}

export function ChatMessages({ messages, room }: ChatMessagesProps) {
  const { user } = useUserStore();

  return (
    <div className="space-y-4">
      {messages.map(msg => {
        const isCurrentUser = msg.created_by === room.client;
        const isSentByCurrentUser = msg.created_by === user?.id;

        return (
          <div
            key={msg.id}
            data-id={msg.id}
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
              {msg.is_read && isSentByCurrentUser && (
                <p className="text-xs text-green-500 mt-1">خوانده شده</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
