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
    const first = parsed.error.issues[0]?.message ?? "Invalid email or password.";
    loginRedirect(first);
  }
  return parsed.data;
}

async function getRequestOrigin() {
  return (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signInWithPassword(formData: FormData) {
  const { email, password } = parseCredentials(formData);
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    loginRedirect(GENERIC_AUTH_ERROR);
  }

  redirect("/");
}

export async function signUpWithPassword(formData: FormData) {
  const { email, password } = parseCredentials(formData);
  const supabase = await createClient();
  const origin = await getRequestOrigin();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`
    }
  });

  if (error) {
    loginRedirect(GENERIC_SIGNUP_ERROR);
  }

  redirect("/login?message=Check your email to confirm your account.");
}

export async function signInWithGoogle() {
  const origin = await getRequestOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`
    }
  });

  if (error || !data.url) {
    loginRedirect(GENERIC_OAUTH_ERROR);
  }

  redirect(data.url as RedirectTarget);
}
