"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupport } from "@/hooks/socket/use-socket";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AgentSidebar() {
  const pathname = usePathname();
  const { rooms } = useSupport();
  const [isOpen, setIsOpen] = useState(false);

  const pendingRooms = rooms.filter(room => !room.agentId);

  const navItems = [
    {
      name: "داشبورد",
      href: "/agent/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: `گفتگوها ${
        pendingRooms.length > 0 ? `(${pendingRooms.length})` : ""
      }`,
      href: "/agent/chats",
      icon: MessageSquare,
    },
  ];

  // Mobile sidebar toggle
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button - only visible on small screens */}
      <div className="md:hidden fixed top-16 right-4 z-30">
        <Button
          variant="outline"
          size="sm"
          className="bg-white"
          onClick={toggleSidebar}>
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
            پنل پشتیبان
          </h2>

          <nav className="space-y-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)} // Close sidebar on navigation (mobile)
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                  pathname === item.href
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-black"
                )}>
                <item.icon className="ml-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {rooms.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                گفتگوهای فعال
              </h3>
              <div className="space-y-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {rooms
                  .filter(room => room.agentId)
                  .map(room => (
                    <Link
                      key={room.id}
                      href={`/agent/chats/${room.id}`}
                      onClick={() => setIsOpen(false)} // Close sidebar on navigation (mobile)
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm",
                        pathname === `/agent/chats/${room.id}`
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100 hover:text-black"
                      )}>
                      <MessageSquare className="ml-3 h-4 w-4" />
                      کاربر: {room.userId.substring(0, 6)}...
                    </Link>
                  ))}
              </div>
            </div>
          )}
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
