import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

import type { JWTToken } from "@/types";
import { Sidebar } from "@/components/sidebar";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the authentication token from cookies
  const cookieStore = await cookies();
  const authToken = cookieStore.get("authentication_token");

  if (!authToken?.value) {
    redirect("/login");
  }

  // Decode JWT token (without verification as we just need to check the role)
  const decoded = jwt.decode(authToken.value) as JWTToken;

  // Check if role_name is Admin
  if (decoded.role_name !== "Admin") {
    redirect("/user/support");
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
