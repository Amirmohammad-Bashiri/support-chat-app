"use client";

import Link from "next/link";
import { MessageCircle, HelpCircle, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UserSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      name: "درخواست پشتیبانی",
      href: "/support",
      icon: HelpCircle,
    },
    {
      name: "اتاق گفتگو",
      href: "/chat-room/123",
      icon: MessageCircle,
    },
  ];

  return (
    <>
      {/* Mobile menu button - only visible on small screens */}
      <div className="md:hidden fixed top-16 right-4 z-30">
        <Button
          variant="outline"
          size="sm"
          className="bg-white"
          onClick={() => setIsOpen(!isOpen)}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar - different styles for mobile and desktop */}
      <div
        className={cn(
          "fixed md:relative z-20 bg-white shadow-md md:shadow-none",
          "w-64 md:w-64 h-screen md:h-[calc(100vh-4rem)]",
          "transition-all duration-300 ease-in-out",
          "border-l md:border-l",
          isOpen ? "right-0" : "-right-64 md:right-0", // Slide in/out on mobile
          "md:block" // Always visible on desktop
        )}
        dir="rtl">
        <div className="p-4">
          <h2 className="text-base md:text-lg font-semibold mb-4 text-black">
            منوی کاربر
          </h2>

          <nav className="space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)} // Close sidebar on navigation (mobile)
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-black">
                <item.icon className="ml-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Overlay for mobile - closes sidebar when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-10 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
