"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupport } from "@/hooks/socket/use-socket";

export function UserSidebar() {
  const pathname = usePathname();
  const { currentRoom } = useSupport();

  const navItems = [
    {
      name: "Request Support",
      href: "/user/support",
      icon: HelpCircle,
    },
    ...(currentRoom
      ? [
          {
            name: "Active Chat",
            href: `/user/chat/${currentRoom}`,
            icon: MessageSquare,
          },
        ]
      : []),
  ];

  return (
    <div className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] p-4">
      <h2 className="text-lg font-semibold mb-4">Support</h2>
      <nav className="space-y-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium",
              pathname === item.href
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            )}>
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
