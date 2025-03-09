import useSWR from "swr";

import axiosInstance from "@/api/axios-instance";

import type { User } from "@/types";

const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

const useUser = () => {
  const { data, error } = useSWR<User>("/v1/users/user", fetcher);

  return {
    user: data,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useUser;
