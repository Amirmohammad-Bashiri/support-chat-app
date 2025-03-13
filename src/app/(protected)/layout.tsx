"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import { useUserStore } from "@/store/user-store";
import { Navbar } from "@/components/navbar";
import { SocketInitializer } from "@/components/socket-initializer";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isError } = useUser();
  const { setUser } = useUserStore();

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  useEffect(() => {
    if (isError) {
      // If there's an error fetching user data, redirect to login
      document.cookie =
        "authentication_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/(auth)/login");
    }
  }, [isError, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SocketInitializer />
      <Navbar user={user || null} />
      <main className="container mx-auto py-6 px-4">{children}</main>
    </div>
  );
}
