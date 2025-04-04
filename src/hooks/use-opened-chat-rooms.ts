import useSWR from "swr";
import axiosInstance from "@/api/axios-instance";

import type { Room } from "@/store/socket-store";

const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

export function useOpenedChatRooms() {
  const { data, error, isLoading } = useSWR<Room[]>(
    "/v1/support_chat/user/opened-chat-rooms/",
    fetcher,
    {
      refreshInterval: 2000,
    }
  );

  return {
    openedChatRooms: data || [], // Ensure it returns an empty array if data is undefined
    isLoading,
    isError: !!error,
  };
}
