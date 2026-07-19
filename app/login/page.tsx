import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Chrome, LockKeyhole, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword
} from "@/app/login/actions";

export const metadata: Metadata = {
  title: "Sign in — Raghu Rokda",
  description: "Sign in to Raghu Rokda.",
  robots: { index: false, follow: false }
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const { message } = await searchParams;

  return (
    <main className="min-h-screen bg-canvas px-5 py-12 text-ink-900">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md flex-col items-center justify-center">
        <div className="mb-6 flex items-center gap-2">
          <span
            aria-hidden
            className="inline-flex size-8 items-center justify-center rounded-md bg-ink-900 text-sm font-semibold text-white"
          >
            ₹₹
          </span>
          <span className="text-lg font-medium">Raghu Rokda</span>
        </div>

        <div className="w-full rounded-lg border border-line bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h1 className="text-xl font-semibold">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-400">Sign in to continue to your planner.</p>
          </div>

          {message ? (
            <div className="mb-4 rounded-md border border-line bg-canvas p-3 text-sm text-ink-700">
              {message}
            </div>
          ) : null}

          <form action={signInWithPassword} className="grid gap-3">
            <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-ink-400">
              Email
              <span className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" />
                <input
                  className="focus-ring w-full rounded-md border border-line px-9 py-2.5 text-sm"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </span>
            </label>
            <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-ink-400">
              Password
              <span className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" />
                <input
                  className="focus-ring w-full rounded-md border border-line px-9 py-2.5 text-sm"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  minLength={6}
                  required
                />
              </span>
            </label>
            <button className="focus-ring mt-1 rounded-md bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-700">
              Sign in
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-ink-300">
            <span className="h-px flex-1 bg-line-faint" />
            or
            <span className="h-px flex-1 bg-line-faint" />
          </div>

          <form action={signInWithGoogle}>
            <button className="focus-ring flex w-full items-center justify-center gap-2 rounded-md border border-line px-4 py-2.5 text-sm font-medium hover:bg-canvas">
              <Chrome className="size-4" />
              Continue with Google
            </button>
          </form>

          <details className="mt-5 border-t border-line-faint pt-4 text-sm">
            <summary className="cursor-pointer text-ink-400 hover:text-ink-700">
              Create a new account
            </summary>
            <form action={signUpWithPassword} className="mt-3 grid gap-2">
              <input
                className="focus-ring rounded-md border border-line px-3 py-2.5 text-sm"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <input
                className="focus-ring rounded-md border border-line px-3 py-2.5 text-sm"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
              />
              <button className="focus-ring rounded-md border border-line px-4 py-2.5 text-sm font-medium hover:bg-canvas">
                Create account
              </button>
            </form>
          </details>
        </div>
      </section>
    </main>
  );
}
