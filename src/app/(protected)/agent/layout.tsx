"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import { useSocketStore } from "@/store/socket-store";
import { AgentSidebar } from "@/components/agent-sidebar";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const { setIsAgent } = useSocketStore();

  useEffect(() => {
    if (!isLoading && user?.role_name !== "agent") {
      router.push("/user/support");
    } else if (user?.role_name === "agent") {
      setIsAgent(true);
    }
  }, [user, isLoading, router, setIsAgent]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex">
      <AgentSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
