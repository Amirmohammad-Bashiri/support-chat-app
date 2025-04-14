"use client";

import { useEffect } from "react";

import useUser from "@/hooks/useUser";
import { useUserStore } from "@/store/user-store";
import { Navbar } from "@/components/navbar";
import { SocketInitializer } from "@/components/socket-initializer";
import { Spinner } from "@/components/ui/spinner";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useUser();
  const { setUser } = useUserStore();

  useEffect(() => {
    if (user) {
      setUser(user);
      console.log("user", user);
    }
  }, [user, setUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50">
      <SocketInitializer />
      <Navbar user={user || null} />
      <main className="container mx-auto py-2 md:py-6 px-4">{children}</main>
    </div>
  );
}
