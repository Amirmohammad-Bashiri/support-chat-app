"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Support Chat
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span>
              {user.first_name} {user.last_name}
              {user.role_name === "agent" && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Agent
                </span>
              )}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
