"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PhoneIcon } from "lucide-react";
import { countryCodes } from "../constants";
import { useLogin } from "@/hooks/auth/use-login";

import type { LoginResponse } from "@/types";

interface LoginFormProps {
  onSuccess: (response: LoginResponse) => void;
}

interface LoginFormInputs {
  countryDialingCode: string;
  mobileNumber: string;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading, reset } = useLogin();
  const [loginError, setLoginError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormInputs>({
    defaultValues: {
      countryDialingCode: "+98", // Default to Iran
    },
  });

  const selectedCountryCode = watch("countryDialingCode");

  const onSubmit: SubmitHandler<LoginFormInputs> = async data => {
    setLoginError(null);

    // Sanitize mobile number
    let sanitizedMobileNumber = data.mobileNumber;
    if (sanitizedMobileNumber.startsWith("0")) {
      sanitizedMobileNumber = sanitizedMobileNumber.substring(1);
    }
    if (
      sanitizedMobileNumber.startsWith(selectedCountryCode.replace("+", ""))
    ) {
      sanitizedMobileNumber = sanitizedMobileNumber.substring(
        selectedCountryCode.length - 1
      );
    }

    try {
      const response = await login({
        ...data,
        mobileNumber: sanitizedMobileNumber,
      });
      onSuccess(response);
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : "خطای غیرمنتظره‌ای رخ داد"
      );
    }
  };

  const handleRetry = () => {
    setLoginError(null);
    reset();
  };

  return (
    <Card className="border border-border/40 shadow-sm w-full">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-xl font-semibold text-center">
          ورود
        </CardTitle>
        <CardDescription className="text-center text-sm">
          برای شروع، شماره موبایل خود را وارد کنید
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="countryDialingCode" className="text-sm font-medium">
              کد کشور
            </Label>
            <Select
              onValueChange={value => setValue("countryDialingCode", value)}
              defaultValue={selectedCountryCode}>
              <SelectTrigger className="w-full h-10 rounded-md border border-input bg-background">
                <SelectValue placeholder="کد کشور را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.country} ({country.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobileNumber" className="text-sm font-medium">
              شماره موبایل
            </Label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="mobileNumber"
                type="tel"
                className="h-10 pl-10 rounded-md border border-input bg-background"
                placeholder="9120000000"
                {...register("mobileNumber", {
                  required: "شماره موبایل الزامی است",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "شماره موبایل نامعتبر است",
                  },
                })}
              />
            </div>
            {errors.mobileNumber && (
              <p className="text-sm text-destructive mt-1">
                {errors.mobileNumber.message}
              </p>
            )}
          </div>
          {loginError && (
            <Alert variant="destructive" className="text-sm py-2">
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pt-2 pb-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-md font-medium transition-colors">
            {isLoading ? "در حال ورود..." : "ورود"}
          </Button>
          {loginError && (
            <Button
              onClick={handleRetry}
              variant="outline"
              className="w-full h-10 rounded-md font-medium mt-2">
              تلاش مجدد
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
