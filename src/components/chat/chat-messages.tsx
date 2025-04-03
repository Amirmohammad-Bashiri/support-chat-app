import type { Room, Message } from "@/store/socket-store";

interface ChatMessagesProps {
  messages: Message[];
  room: Room;
}

export function ChatMessages({ messages, room }: ChatMessagesProps) {
  const uniqueMessages = Array.from(
    new Map(messages.map(msg => [msg.id, msg])).values()
  );

  return (
    <div className="space-y-4">
      {uniqueMessages.map(msg => {
        const isCurrentUser = msg.created_by === room.client;
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
