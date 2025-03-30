import useSWR from "swr";
import type { Room } from "@/store/socket-store";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then(res => {
    if (!res.ok) {
      throw new Error("Failed to fetch admin opened chat rooms");
    }
    return res.json();
  });

export function useAdminOpenedChatRooms() {
  const { data, error, isLoading } = useSWR<Room[]>(
    "http://localhost:85/v1/support_chat/admin/opened-chat-rooms/",
    fetcher
  );

  return {
    adminOpenedChatRooms: data || [], // Ensure it returns an empty array if data is undefined
    isLoading,
    isError: !!error,
  };
}
