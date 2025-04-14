import useSWRMutation from "swr/mutation";
import axios from "axios";
import axiosInstance from "@/api/axios-instance";

interface LoginFormInputs {
  countryDialingCode: string;
  mobileNumber: string;
}

export interface LoginResponse {
  mobileNumber: string;
  timeout: number;
  userExist: boolean;
}

async function loginUser(
  url: string,
  { arg }: { arg: LoginFormInputs }
): Promise<LoginResponse> {
  const response = await axiosInstance.post(url, {
    mobile_number: arg.mobileNumber,
    country_dialing_code: arg.countryDialingCode,
  });
  return response.data;
}

export function useLogin() {
  const { trigger, error, isMutating, reset } = useSWRMutation(
    "/v1/users/login",
    loginUser
  );

  const login = async (data: LoginFormInputs): Promise<LoginResponse> => {
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
    login,
    isLoading: isMutating,
    error: error ? error.message : null,
    reset,
  };
}
