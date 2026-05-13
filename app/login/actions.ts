"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

type RedirectTarget = Parameters<typeof redirect>[0];

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(6, "Password must be at least 6 characters.")
});

const GENERIC_AUTH_ERROR = "Invalid email or password.";
const GENERIC_SIGNUP_ERROR = "Could not create account. Please try again.";
const GENERIC_OAUTH_ERROR = "Google sign-in failed. Please try again.";

function loginRedirect(message: string): never {
  redirect(`/login?message=${encodeURIComponent(message)}`);
}

function parseCredentials(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });
  if (!parsed.success) {
    loginRedirect(parsed.error.issues[0]?.message ?? "Invalid email or password.");
  }
  return parsed.data;
}

// Resolve the site origin for OAuth callbacks. Prefer the configured
// NEXT_PUBLIC_SITE_URL (production), fall back to the proxy-aware Host header
// (local dev), and finally to localhost.
async function getSiteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (host) {
    const proto = headerList.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

export async function signInWithPassword(formData: FormData) {
  const { email, password } = parseCredentials(formData);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) loginRedirect(GENERIC_AUTH_ERROR);
  redirect("/");
}

export async function signUpWithPassword(formData: FormData) {
  const { email, password } = parseCredentials(formData);
  const supabase = await createClient();
  const origin = await getSiteOrigin();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` }
  });

  if (error) loginRedirect(GENERIC_SIGNUP_ERROR);
  redirect("/login?message=Check your email to confirm your account.");
}

export async function signInWithGoogle() {
  const origin = await getSiteOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` }
  });

  if (error || !data.url) loginRedirect(GENERIC_OAUTH_ERROR);
  redirect(data.url as RedirectTarget);
}
