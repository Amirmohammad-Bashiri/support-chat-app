import useSWR from "swr";
import axios from "axios";

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export function useMessages(roomId: number) {
  const { data, error, isLoading, mutate } = useSWR(
    `http://localhost:85/v1/support_chat/messages/?roomId=${roomId}`,
    fetcher
  );

  return {
    messages: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}
