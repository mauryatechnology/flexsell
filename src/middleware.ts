import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isClientPath = pathname.startsWith("/client");
  const isAdminPath = pathname.startsWith("/admin");
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  if (isClientPath || isAdminPath) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    const payload = decodeJwt(token);
    if (!payload || !payload.exp || payload.exp * 1000 < Date.now()) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }

    if (isAdminPath && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isClientPath && payload.role !== "customer") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  if (isAuthPage && token) {
    const payload = decodeJwt(token);
    if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
      const dest = payload.role === "admin" ? "/admin" : "/client";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return NextResponse.next();
}

function decodeJwt(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export const config = {
  matcher: [
    "/client/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password"
  ],
};
