import useSWR from "swr";
import type { Room } from "@/store/socket-store";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then(res => {
    if (!res.ok) {
      throw new Error("Failed to fetch opened chat rooms");
    }
    return res.json();
  });

export function useOpenedChatRooms() {
  const { data, error, isLoading } = useSWR<Room[]>(
    "http://localhost:85/v1/support_chat/user/opened-chat-rooms/",
    fetcher
  );

  return {
    openedChatRooms: data || [], // Ensure it returns an empty array if data is undefined
    isLoading,
    isError: !!error,
  };
}
