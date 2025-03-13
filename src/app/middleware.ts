import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has("authentication_token");

  // Public paths that don't require authentication
  const isPublicPath = pathname.startsWith("/(auth)") || pathname === "/login";

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/(auth)/login", request.url));
  }

  // Redirect authenticated users away from login page
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
