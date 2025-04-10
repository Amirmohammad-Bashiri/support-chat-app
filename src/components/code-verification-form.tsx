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
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface CodeVerificationFormProps {
  mobileNumber: string;
  countryDialingCode: string;
  initialTimeout: number;
  userExists: boolean;
  onSuccess: () => void;
  onBack: () => void;
}

interface VerificationFormInputs {
  verificationCode: string;
  firstName?: string;
  lastName?: string;
}

export default function CodeVerificationForm({
  mobileNumber,
  countryDialingCode,
  initialTimeout,
  userExists,
  onSuccess,
  onBack,
}: CodeVerificationFormProps) {
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [countdown, setCountdown] = useState(initialTimeout);
  const { verify, isLoading: isVerifying } = useVerifyCode({ userExists });
  const { login, isLoading: isResending } = useLogin();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    register,
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
          first_name: data.firstName,
          last_name: data.lastName,
        });
        onSuccess();
      } catch (error) {
        setVerificationError(
          error instanceof Error ? error.message : "تأیید ناموفق بود"
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
        error instanceof Error ? error.message : "ارسال مجدد کد ناموفق بود"
      );
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">
          تأیید شماره تلفن شما
        </CardTitle>
        <CardDescription className="text-center">
          کد تایید به شماره{" "}
          <span className="font-bold">{mobileNumber.slice(1)}+</span> ارسال شد
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!userExists && (
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="firstName"
                  className="block text-sm font-medium">
                  نام
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  className="w-full border rounded p-2"
                  {...register("firstName", {
                    required: "لطفا نام خود را وارد کنید",
                  })}
                />
                {errors.firstName && (
                  <p className="text-sm text-rose-500 mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName" className="block text-sm font-medium">
                  نام خانوادگی
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  className="w-full border rounded p-2"
                  {...register("lastName", {
                    required: "لطفا نام خانوادگی خود را وارد کنید",
                  })}
                />
                {errors.lastName && (
                  <p className="text-sm text-rose-500 mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="space-y-2 flex items-center justify-center">
            <InputOTP
              maxLength={5}
              autoFocus
              onChange={value => setValue("verificationCode", value)}>
              <InputOTPGroup style={{ direction: "ltr" }}>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
              </InputOTPGroup>
            </InputOTP>
            {errors.verificationCode && (
              <p className="text-sm text-red-500 text-center mt-2">
                لطفاً یک کد ۵ رقمی معتبر وارد کنید
              </p>
            )}
          </div>
          {verificationError && (
            <Alert variant="destructive">
              <AlertDescription>{verificationError}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={isVerifying} className="w-full">
            {isVerifying ? "در حال تأیید..." : "تأیید کد"}
          </Button>
        </form>
        <div className="text-sm text-gray-500 text-center mt-4">
          {countdown > 0 ? (
            <p>ارسال مجدد کد در {countdown} ثانیه</p>
          ) : (
            <Button
              variant="link"
              className="p-0"
              onClick={handleResend}
              disabled={isResending}>
              {isResending ? "در حال ارسال مجدد..." : "ارسال مجدد کد"}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={onBack} className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> بازگشت به صفحه ورود
        </Button>
      </CardFooter>
    </Card>
  );
}
