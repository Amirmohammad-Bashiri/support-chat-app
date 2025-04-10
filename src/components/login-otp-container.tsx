"use client";

import { useState } from "react";
import { useSocketStore } from "@/store/socket-store";

import LoginForm from "./login-form";
import CodeVerificationForm from "./code-verification-form";

import type { LoginResponse } from "@/types";

type FormState = "login" | "verification" | "success";

export default function LoginOTPContainer() {
  const [formState, setFormState] = useState<FormState>("login");
  const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(
    null
  );
  const { setSocket } = useSocketStore();

  const handleLoginSuccess = (response: LoginResponse) => {
    setLoginResponse(response);
    setFormState("verification");
  };

  const handleVerificationSuccess = async () => {
    setFormState("success");

    // Clear existing socket if any
    setSocket(null);

    // Use location.href for a full page refresh to ensure cookies are properly set
    window.location.href = "/";
  };

  const handleBack = () => {
    setFormState("login");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
        {formState === "login" && <LoginForm onSuccess={handleLoginSuccess} />}
        {formState === "verification" && loginResponse && (
          <CodeVerificationForm
            mobileNumber={loginResponse.mobileNumber}
            userExists={loginResponse.userExist}
            countryDialingCode={loginResponse.mobileNumber.slice(0, 3)}
            initialTimeout={loginResponse.timeout}
            onSuccess={handleVerificationSuccess}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
