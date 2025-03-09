"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import LoginForm from "./login-form";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CodeVerificationForm from "./code-verification-form";

import type { LoginResponse } from "@/types";
import useUser from "@/hooks/useUser";

type FormState = "login" | "verification" | "success";

export default function LoginOTPContainer() {
  const [formState, setFormState] = useState<FormState>("login");
  const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(
    null
  );
  const router = useRouter();
  const { user, isLoading, isError } = useUser(); // Use the useUser hook

  const handleLoginSuccess = (response: LoginResponse) => {
    setLoginResponse(response);
    setFormState("verification");
  };

  const handleVerificationSuccess = async () => {
    setFormState("success");
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  useEffect(() => {
    if (formState === "success" && user) {
      console.log("User data:", user);
    }
  }, [formState, user]);

  const handleBack = () => {
    setFormState("login");
  };

  return (
    <div className="flex items-center justify-center p-4">
      {formState === "login" && <LoginForm onSuccess={handleLoginSuccess} />}
      {formState === "verification" && loginResponse && (
        <CodeVerificationForm
          mobileNumber={loginResponse.mobileNumber}
          countryDialingCode={loginResponse.mobileNumber.slice(0, 3)}
          initialTimeout={loginResponse.timeout}
          onSuccess={handleVerificationSuccess}
          onBack={handleBack}
        />
      )}

      {formState === "success" && (
        <Card className="w-full mx-auto">
          <CardContent>
            {isLoading && (
              <Alert>
                <AlertDescription>Loading user data...</AlertDescription>
              </Alert>
            )}
            {isError && (
              <Alert variant="destructive">
                <AlertDescription>Failed to load user data.</AlertDescription>
              </Alert>
            )}
            {!isLoading && !isError && (
              <Alert>
                <AlertDescription>
                  Verification successful! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
