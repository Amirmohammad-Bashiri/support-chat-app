import useSWRMutation from "swr/mutation";
import axios from "axios";

import axiosInstance from "@/api/axios-instance";

interface VerificationData {
  mobile_number: string;
  verification_code: string;
  first_name?: string;
  last_name?: string;
}

interface VerifyCodeArgs {
  userExists: boolean;
}

async function verifyCode(url: string, { arg }: { arg: VerificationData }) {
  const response = await axiosInstance.post(url, arg);
  return response.data;
}

export function useVerifyCode({ userExists }: VerifyCodeArgs) {
  const url = userExists
    ? "/v1/users/login/verification-login"
    : "/v1/users/login/verification-creation";

  const { trigger, error, isMutating, reset } = useSWRMutation(url, verifyCode);

  const verify = async (data: VerificationData) => {
    try {
      const result = await trigger(data);
      return result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || error.message);
      } else {
        throw new Error("An unexpected error occurred");
      }
    }
  };

  return {
    verify,
    isLoading: isMutating,
    error: error ? error.message : null,
    reset,
  };
}
