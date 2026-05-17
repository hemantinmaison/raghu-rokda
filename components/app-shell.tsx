import type { ReactNode } from "react";
import Link from "next/link";
import { Quote } from "lucide-react";
import { HeaderProfile } from "@/components/header-profile";

type AppShellProps = {
  children: ReactNode;
  userEmail?: string;
  monthlySalary?: number;
};

export function AppShell({ children, userEmail, monthlySalary }: AppShellProps) {
  return (
    <main className="min-h-screen bg-canvas text-ink-900">
      <header className="sticky top-0 z-20 border-b border-line-faint bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-5">
          <Link href="/" className="focus-ring flex items-center gap-2 rounded">
            <span
              aria-hidden
              className="inline-flex size-6 items-center justify-center rounded-md bg-ink-900 text-[13px] font-semibold text-white"
            >
              RR
            </span>
            <span className="text-sm font-medium text-ink-900">Raghu Rokda</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/quotes"
              className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm text-ink-700 hover:bg-canvas"
            >
              <Quote className="size-4" />
              Quotes
            </Link>
            {userEmail ? (
              <HeaderProfile userEmail={userEmail} monthlySalary={monthlySalary ?? 0} />
            ) : (
              <Link
                href="/login"
                className="focus-ring rounded-md bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-700"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}

export function DashboardLoadError({ message }: { message: string }) {
  return (
    <section className="mx-auto max-w-2xl px-5 py-12">
      <div className="rounded-lg border border-danger-200 bg-danger-50 p-5 text-danger-900">
        <h2 className="text-lg font-semibold">Could not load planner data</h2>
        <p className="mt-2 text-sm leading-6">{message}</p>
        <p className="mt-3 text-sm leading-6">
          Check that <code>.env.local</code> points to the right Supabase project, run{" "}
          <code>supabase/schema.sql</code>, and confirm the tables exist in the public schema.
        </p>
      </div>
    </section>
  );
}
