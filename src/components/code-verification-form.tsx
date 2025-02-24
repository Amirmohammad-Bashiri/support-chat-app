"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useVerifyCode } from "@/hooks/auth/use-verify-code";
import { useLogin } from "@/hooks/auth/use-login";

interface CodeVerificationFormProps {
  mobileNumber: string;
  countryDialingCode: string;
  initialTimeout: number;
  onSuccess: () => void;
  onBack: () => void;
}

interface VerificationFormInputs {
  verificationCode: string;
}

export default function CodeVerificationForm({
  mobileNumber,
  countryDialingCode,
  initialTimeout,
  onSuccess,
  onBack,
}: CodeVerificationFormProps) {
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [countdown, setCountdown] = useState(initialTimeout);
  const { verify, isLoading: isVerifying } = useVerifyCode();
  const { login, isLoading: isResending } = useLogin();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerificationFormInputs>();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const onSubmit = useCallback(
    async (data: VerificationFormInputs) => {
      setVerificationError(null);
      try {
        await verify({
          mobile_number: mobileNumber,
          verification_code: data.verificationCode,
        });
        onSuccess();
      } catch (error) {
        setVerificationError(
          error instanceof Error ? error.message : "Verification failed"
        );
      }
    },
    [mobileNumber, onSuccess, verify]
  );

  const handleResend = async () => {
    try {
      const response = await login({
        countryDialingCode,
        mobileNumber: mobileNumber.substring(3),
      });
      setCountdown(response.timeout);
      setVerificationError(null);
    } catch (error) {
      setVerificationError(
        error instanceof Error ? error.message : "Failed to resend code"
      );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">
          Verify Your Number
        </CardTitle>
        <CardDescription className="text-center">
          We&apos;ve sent a code to{" "}
          <span className="font-bold">{mobileNumber}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2 flex items-center justify-center">
            <InputOTP
              maxLength={5}
              autoFocus
              onChange={value => setValue("verificationCode", value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
              </InputOTPGroup>
            </InputOTP>
            {errors.verificationCode && (
              <p className="text-sm text-red-500 text-center mt-2">
                Please enter a valid 5-digit code
              </p>
            )}
          </div>
          {verificationError && (
            <Alert variant="destructive">
              <AlertDescription>{verificationError}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={isVerifying} className="w-full">
            {isVerifying ? "Verifying..." : "Verify Code"}
          </Button>
        </form>
        <div className="text-sm text-gray-500 text-center mt-4">
          {countdown > 0 ? (
            <p>Resend code in {countdown} seconds</p>
          ) : (
            <Button
              variant="link"
              className="p-0"
              onClick={handleResend}
              disabled={isResending}>
              {isResending ? "Resending..." : "Resend code"}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBack} className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
}
