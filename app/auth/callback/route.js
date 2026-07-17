import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

function isSafeRedirect(destination, baseUrl) {
  if (!destination || destination === "/") return "/";
  try {
    const url = new URL(destination, baseUrl);
    const appUrl = new URL(baseUrl);
    if (url.origin !== appUrl.origin) return "/";
    if (!url.pathname.startsWith("/")) return "/";
    return url.pathname + url.search;
  } catch {
    return "/";
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const next = searchParams.get("next") ?? "/";

  const redirectTo = isSafeRedirect(next, request.url);

  if (errorParam === "access_denied") {
    return NextResponse.redirect(new URL("/?signin=cancelled", request.url));
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }

    console.error("Auth callback error:", error?.message || error);
    return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent("Authentication failed. Please try signing in again.")}`, request.url));
  }

  return NextResponse.redirect(new URL("/error?message=No+authorization+code+provided.+Please+try+signing+in+again.", request.url));
}
