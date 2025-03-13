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
    try {
      const response = await login(data);
      onSuccess(response);
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : "An unexpected error occurred"
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
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Enter your mobile number to get started
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="countryDialingCode">Country Code</Label>
            <Select
              onValueChange={value => setValue("countryDialingCode", value)}
              defaultValue={selectedCountryCode}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select country code" />
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
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="mobileNumber"
                type="tel"
                className="pl-10"
                placeholder="09120000000"
                {...register("mobileNumber", {
                  required: "Mobile number is required",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Invalid mobile number",
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
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          {loginError && (
            <Button onClick={handleRetry} variant="outline" className="w-full">
              Retry
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
