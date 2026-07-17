import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse } from "next/server";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return await updateSession(request);
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "127.0.0.1";

  const rateLimitKey = `rl:${ip}`;
  const now = Date.now();
  const cookie = request.cookies.get(rateLimitKey);
  let windowStart = now;
  let count = 0;

  if (cookie?.value) {
    try {
      const parsed = JSON.parse(cookie.value);
      if (now - parsed.t < WINDOW_MS) {
        windowStart = parsed.t;
        count = parsed.c;
      }
    } catch {}
  }

  count++;
  const response = await updateSession(request);

  if (count > MAX_REQUESTS) {
    const retryResponse = NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase() === "set-cookie") {
        retryResponse.headers.append("Set-Cookie", value);
      }
    }
    return retryResponse;
  }

  response.cookies.set(rateLimitKey, JSON.stringify({ t: windowStart, c: count }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60,
    path: "/",
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
