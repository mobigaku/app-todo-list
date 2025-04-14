import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// These routes will be accessible without authentication
const publicRoutes = ["/login", "/register"];
// These routes will be ignored by the middleware completely
const ignoredRoutes = [
  "/_next",
  "/api/auth",
  "/favicon.ico",
  "/images",
  "/fonts",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static files and authentication routes
  if (ignoredRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });
  const isPublicRoute = publicRoutes.includes(pathname);
  const isApiRequest = pathname.startsWith("/api");

  // Handle public routes
  if (isPublicRoute) {
    // If user is logged in and tries to access login/register, redirect to home
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Allow access to public routes for non-authenticated users
    return NextResponse.next();
  }

  // Handle protected routes
  if (!token) {
    // For API requests, return 401 Unauthorized
    if (isApiRequest) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // For page requests, redirect to login with return URL
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, request.url)
    );
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

export const config = {
  // Match all routes except static files
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (Next.js internals)
     * 2. /api/auth (NextAuth.js endpoints)
     * 3. /favicon.ico, /images, /fonts (Static files)
     * 4. /_next/static (Static files)
     * 5. /_next/image (Next.js image optimization)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|fonts).*)",
  ],
}; 