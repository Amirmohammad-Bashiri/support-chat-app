import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  subject: string;
  isAgent?: boolean;
  onEndChat?: () => void;
}

export function ChatHeader({
  subject,
  isAgent = false,
  onEndChat,
}: ChatHeaderProps) {
  return (
    <div className="border-b bg-black text-white p-4 flex justify-between items-center">
      <span>{isAgent ? `موضوع: ${subject}` : "موضوع"}</span>
      {isAgent && (
        <Button variant="destructive" onClick={onEndChat}>
          پایان گفتگو
        </Button>
      )}
    </div>
  );
}
