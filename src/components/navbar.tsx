"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, MessageCircle, Bell, ChevronDown, Menu } from "lucide-react";

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
import { useMediaQuery } from "@/hooks/use-mobile";
import type { User } from "@/types";
import { useSocketStore } from "@/store/socket-store";
import { Sidebar } from "./sidebar";

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const { setSocket } = useSocketStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

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
    <header
      className="bg-primary text-primary-foreground shadow-sm sticky top-0 z-50"
      dir="rtl">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3 flex flex-row-reverse justify-between items-center">
        <div className="flex items-center gap-1">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-seoncdar-foreground h-8 w-8 sm:h-10 sm:w-10">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute top-1 left-1 h-2 w-2 rounded-full bg-destructive"></span>
          </Button>

          <Link
            href={
              user?.role_name === "Admin" ? "/agent/dashboard" : "/user/support"
            }
            className="flex items-center gap-1 sm:gap-2 transition-transform hover:scale-105">
            <div className="bg-primary-foreground text-primary p-1.5 sm:p-2 rounded-full">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-lg sm:text-xl font-bold">پشتیبانی</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile menu button with SheetTrigger */}
          {isMobile && (
            <Sidebar>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </Sidebar>
          )}

          {user && (
            <div className="flex items-center">
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2 py-1 hover:bg-primary/90 hover:text-white text-primary-foreground">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-primary-foreground/50">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs sm:text-sm">
                        {getInitials(user.first_name, user.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-col items-start hidden sm:flex">
                      <span className="font-medium text-sm text-white">
                        {user.first_name} {user.last_name}
                      </span>
                    </div>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 sm:w-56"
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
