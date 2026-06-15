import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse } from "next/server";

const ipMap = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

function rateLimit(ip) {
  const now = Date.now();
  const entry = ipMap.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    ipMap.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  if (entry.count > MAX_REQUESTS) return false;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipMap) {
    if (now - entry.start > WINDOW_MS) ipMap.delete(ip);
  }
}, 60_000);

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return await updateSession(request);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "127.0.0.1";

  if (!rateLimit(ip)) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
