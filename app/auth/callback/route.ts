import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/redirects";

const GENERIC_AUTH_ERROR = "Sign in failed. Please try again.";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectPath = safeRedirectPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const message = encodeURIComponent(GENERIC_AUTH_ERROR);
      return NextResponse.redirect(new URL(`/login?message=${message}`, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}
