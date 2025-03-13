import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has("authentication_token");

  // Public paths that don't require authentication
  const isPublicPath = pathname === "/login";

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle role-based routing for authenticated users at root path
  if (isAuthenticated && pathname === "/") {
    try {
      const token = request.cookies.get("authentication_token");
      if (token && token.value) {
        // Safely parse the JWT without using jwt library
        const payload = JSON.parse(
          Buffer.from(token.value.split(".")[1], "base64").toString()
        );

        if (payload.role_name === "Admin") {
          return NextResponse.redirect(
            new URL("/agent/dashboard", request.url)
          );
        } else if (payload.role_name === "Business Unit Owner") {
          return NextResponse.redirect(new URL("/user/support", request.url));
        }
      }
    } catch (error) {
      console.error("Error parsing token:", error);
      // Continue to next middleware if token parsing fails
    }
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
