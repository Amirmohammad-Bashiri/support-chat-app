import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("authentication_token");

  if (!isAuthenticated) {
    redirect("/login");
  }

  // For authenticated users, redirect to the home page
  // Role-based redirection will happen client-side
  redirect("/home");
}
