import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || "";
  const protectedPaths = ["/select-brand", "/dashboard"];
  const isProtected = protectedPaths.some((p) =>
    req.nextUrl.pathname.startsWith(p)
  );
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/select-brand/:path*", "/dashboard/:path*"],
};
