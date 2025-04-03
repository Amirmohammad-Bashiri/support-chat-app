import useSWR from "swr";

import axiosInstance from "@/api/axios-instance";

import type { Room } from "@/store/socket-store";

const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

export function useAdminOpenedChatRooms(roomType: "pending" | "active") {
  const { data, error, isLoading } = useSWR<Room[]>(
    `/v1/support_chat/admin/opened-support-chat-set/?mode=${roomType}`,
    fetcher
  );

  return {
    adminOpenedChatRooms: data || [], // Ensure it returns an empty array if data is undefined
    isLoading,
    isError: !!error,
  };
}
