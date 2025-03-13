"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSupport } from "@/hooks/socket/use-socket";

export function AgentSidebar() {
  const pathname = usePathname();
  const { rooms } = useSupport();

  const pendingRooms = rooms.filter(room => !room.agentId);

  const navItems = [
    {
      name: "Dashboard",
      href: "/agent/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: `Chats ${
        pendingRooms.length > 0 ? `(${pendingRooms.length})` : ""
      }`,
      href: "/agent/chats",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] p-4">
      <h2 className="text-lg font-semibold mb-4">Agent Portal</h2>
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

      {rooms.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Active Chats
          </h3>
          <div className="space-y-1">
            {rooms
              .filter(room => room.agentId)
              .map(room => (
                <Link
                  key={room.id}
                  href={`/agent/chats/${room.id}`}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm",
                    pathname === `/agent/chats/${room.id}`
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}>
                  <MessageSquare className="mr-3 h-4 w-4" />
                  User: {room.userId.substring(0, 8)}...
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
