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
  title: "Sign in — Finance Planner",
  description: "Sign in to your personal finance planner.",
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
    <main className="min-h-screen bg-canvas px-5 py-8 text-ink-900">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Finance Planner
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Budget, clear debt, then plan what you want next.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink-500">
              A private planner for salary, monthly expenses, debt payoff, and wishlist goals.
              Your future AI insights can plug into the same clean data model later.
            </p>
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-2xl font-semibold">Sign in</h2>
              <p className="mt-1 text-sm text-ink-500">Use email or Google to continue.</p>
            </div>

            {message ? (
              <div className="mb-4 rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">
                {message}
              </div>
            ) : null}

            <form action={signInWithPassword} className="grid gap-3">
              <label className="grid gap-1 text-sm font-medium">
                Email
                <span className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
                  <input
                    className="focus-ring w-full rounded-md border border-line px-9 py-3"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </span>
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Password
                <span className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
                  <input
                    className="focus-ring w-full rounded-md border border-line px-9 py-3"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    minLength={6}
                    required
                  />
                </span>
              </label>
              <button className="focus-ring rounded-md bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800">
                Sign in
              </button>
            </form>

            <form action={signUpWithPassword} className="mt-3 grid gap-3 border-t border-line pt-4">
              <p className="text-sm font-medium">Create account with email</p>
              <input
                className="focus-ring rounded-md border border-line px-3 py-3"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <input
                className="focus-ring rounded-md border border-line px-3 py-3"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                minLength={6}
                required
              />
              <button className="focus-ring rounded-md border border-line px-4 py-3 font-semibold hover:bg-canvas">
                Create account
              </button>
            </form>

            <form action={signInWithGoogle} className="mt-3">
              <button className="focus-ring flex w-full items-center justify-center gap-2 rounded-md border border-line px-4 py-3 font-semibold hover:bg-canvas">
                <Chrome className="size-4" />
                Continue with Google
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
