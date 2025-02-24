"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import LoginForm from "./login-form";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CodeVerificationForm from "./code-verification-form";

import type { LoginResponse } from "@/types";

type FormState = "login" | "verification" | "success";

export default function LoginOTPContainer() {
  const [formState, setFormState] = useState<FormState>("login");
  const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(
    null
  );
  const router = useRouter();

  const handleLoginSuccess = (response: LoginResponse) => {
    setLoginResponse(response);
    setFormState("verification");
  };

  const handleVerificationSuccess = () => {
    setFormState("success");
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  const handleBack = () => {
    setFormState("login");
  };

  return (
    <div className="flex items-center justify-center p-4">
      {formState === "login" && <LoginForm onSuccess={handleLoginSuccess} />}
      {formState === "verification" && loginResponse && (
        <CodeVerificationForm
          mobileNumber={loginResponse.mobileNumber}
          countryDialingCode={loginResponse.mobileNumber.slice(0, 3)} // Assuming the country code is the first 3 digits
          initialTimeout={loginResponse.timeout}
          onSuccess={handleVerificationSuccess}
          onBack={handleBack}
        />
      )}
      {formState === "success" && (
        <Card className="w-full mx-auto">
          <CardContent>
            <Alert>
              <AlertDescription>
                Verification successful! Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
