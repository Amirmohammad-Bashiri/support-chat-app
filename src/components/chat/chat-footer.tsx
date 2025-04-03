import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatFooterProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
}

export function ChatFooter({
  message,
  onMessageChange,
  onSendMessage,
}: ChatFooterProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage();
  };

  return (
    <div className="border-t p-4">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <Input
          value={message}
          onChange={e => onMessageChange(e.target.value)}
          placeholder="پیام خود را بنویسید..."
          className="flex-1 text-right"
        />
        <Button type="submit" className="bg-black hover:bg-black/90 text-white">
          <Send className="h-4 w-4 ml-2" />
          ارسال
        </Button>
      </form>
    </div>
  );
}
