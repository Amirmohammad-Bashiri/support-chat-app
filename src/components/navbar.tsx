"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, MessageCircle, Bell, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/types";
import { useSocketStore } from "@/store/socket-store";

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const { setSocket } = useSocketStore();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      document.cookie =
        "authentication_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Clear socket connection
      setSocket(null);

      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-sm" dir="rtl">
      <div className="container mx-auto px-4 py-3 flex flex-row-reverse justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform hover:scale-105">
          <div className="bg-primary-foreground text-primary p-2 rounded-full">
            <MessageCircle className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">پشتیبانی</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-seoncdar-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 left-1 h-2 w-2 rounded-full bg-destructive"></span>
          </Button>

          {user && (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 py-1 hover:bg-primary/90 hover:text-white text-primary-foreground">
                    <Avatar className="h-8 w-8 border-2 border-primary-foreground/50">
                      {/* <AvatarImage
                        src={user.avatar_url}
                        alt={`${user.first_name} ${user.last_name}`}
                      /> */}
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {getInitials(user.first_name, user.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">
                        {user.first_name} {user.last_name}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56"
                  style={{ direction: "rtl" }}>
                  <DropdownMenuLabel>حساب کاربری</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center justify-start">
                    پروفایل
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center justify-start">
                    تنظیمات
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive flex items-center justify-start"
                    onClick={handleLogout}>
                    <LogOut className="ml-2 h-4 w-4" />
                    خروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
