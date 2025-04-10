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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
    resetField,
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
      resetField("verificationCode");
      setCountdown(response.timeout);
      setVerificationError(null);
    } catch (error) {
      setVerificationError(
        error instanceof Error ? error.message : "ارسال مجدد کد ناموفق بود"
      );
    }
  };

  return (
    <Card className="border border-border/40 shadow-sm w-full">
      <CardHeader className="space-y-2 pb-4 md:pb-6">
        <CardTitle className="text-xl md:text-2xl lg:text-3xl font-semibold text-center">
          تأیید شماره تلفن شما
        </CardTitle>
        <CardDescription className="text-center text-sm md:text-base">
          کد تایید به شماره{" "}
          <span className="font-bold">{mobileNumber.slice(1)}+</span> ارسال شد
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 px-4 sm:px-6 md:px-8 lg:px-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!userExists && (
            <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
              <div className="md:space-y-3">
                <Label
                  htmlFor="firstName"
                  className="text-sm md:text-base font-medium">
                  نام
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  className="h-10 md:h-12 mt-1 rounded-md border border-input bg-background text-sm md:text-base"
                  {...register("firstName", {
                    required: "لطفا نام خود را وارد کنید",
                  })}
                />
                {errors.firstName && (
                  <p className="text-xs md:text-sm text-destructive mt-1 break-words w-full">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="md:space-y-3">
                <Label
                  htmlFor="lastName"
                  className="text-sm md:text-base font-medium">
                  نام خانوادگی
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  className="h-10 md:h-12 mt-1 rounded-md border border-input bg-background text-sm md:text-base"
                  {...register("lastName", {
                    required: "لطفا نام خانوادگی خود را وارد کنید",
                  })}
                />
                {errors.lastName && (
                  <p className="text-xs md:text-sm text-destructive mt-1 break-words w-full">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <InputOTP
              maxLength={5}
              autoFocus
              onChange={value => setValue("verificationCode", value)}
              className="gap-1 sm:gap-2 md:gap-4">
              <InputOTPGroup
                style={{ direction: "ltr" }}
                className="gap-1 sm:gap-2 md:gap-4 lg:gap-6">
                <InputOTPSlot
                  index={0}
                  className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 md:!text-lg rounded-md border border-input"
                />
                <InputOTPSlot
                  index={1}
                  className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 md:!text-lg rounded-md border border-input"
                />
                <InputOTPSlot
                  index={2}
                  className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 md:!text-lg rounded-md border border-input"
                />
                <InputOTPSlot
                  index={3}
                  className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 md:!text-lg rounded-md border border-input"
                />
                <InputOTPSlot
                  index={4}
                  className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 md:!text-lg rounded-md border border-input"
                />
              </InputOTPGroup>
            </InputOTP>
            {errors.verificationCode && (
              <p className="text-xs md:text-sm text-destructive text-center w-full">
                لطفاً یک کد ۵ رقمی معتبر وارد کنید
              </p>
            )}
          </div>
          {verificationError && (
            <Alert
              variant="destructive"
              className="text-sm md:text-base py-3 w-full">
              <AlertDescription className="break-words">
                {verificationError}
              </AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            disabled={isVerifying}
            className="w-full h-10 md:h-12 rounded-md font-medium transition-colors text-sm md:text-base">
            {isVerifying ? "در حال تأیید..." : "تأیید کد"}
          </Button>
        </form>
        <div className="text-xs md:text-sm text-muted-foreground text-center mt-6">
          {countdown > 0 ? (
            <p>ارسال مجدد کد در {countdown} ثانیه</p>
          ) : (
            <Button
              variant="link"
              className="p-0 h-auto text-xs md:text-sm font-normal"
              onClick={handleResend}
              disabled={isResending}>
              {isResending ? "در حال ارسال مجدد..." : "ارسال مجدد کد"}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-6 px-4 sm:px-6 md:px-8 lg:px-10">
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full h-10 md:h-12 rounded-md font-medium text-sm md:text-base">
          <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" /> بازگشت به صفحه
          ورود
        </Button>
      </CardFooter>
    </Card>
  );
}
