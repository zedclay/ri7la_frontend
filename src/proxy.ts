import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function resolveApiProxyTarget(): string {
  const raw = process.env.API_PROXY_TARGET?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  return "http://127.0.0.1:4000";
}

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    const target = resolveApiProxyTarget();
    const dest = new URL(`${target}${pathname}${search}`);
    return NextResponse.rewrite(dest);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
