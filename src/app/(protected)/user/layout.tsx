"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import { UserSidebar } from "@/components/user-sidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && user?.role_name === "agent") {
      router.push("/agent/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex">
      <UserSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
