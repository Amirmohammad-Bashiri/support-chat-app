"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">ورود</CardTitle>
        <CardDescription>
          برای شروع، شماره موبایل خود را وارد کنید
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="countryDialingCode">کد کشور</Label>
            <Select
              onValueChange={value => setValue("countryDialingCode", value)}
              defaultValue={selectedCountryCode}>
              <SelectTrigger className="w-full">
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
            <Label htmlFor="mobileNumber">شماره موبایل</Label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="mobileNumber"
                type="tel"
                className="pl-10"
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
              <p className="text-sm text-rose-500">
                {errors.mobileNumber.message}
              </p>
            )}
          </div>
          {loginError && (
            <Alert variant="destructive">
              <AlertTitle>خطا</AlertTitle>
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "در حال ورود..." : "ورود"}
          </Button>
          {loginError && (
            <Button onClick={handleRetry} variant="outline" className="w-full">
              تلاش مجدد
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
