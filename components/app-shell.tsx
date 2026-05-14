import type { ReactNode } from "react";
import { signOut } from "@/app/auth/actions";
import { HeaderProfile } from "@/components/header-profile";

type AppShellProps = {
  children: ReactNode;
  userEmail?: string;
  monthlySalary?: number;
};

export function AppShell({ children, userEmail, monthlySalary }: AppShellProps) {
  return (
    <main className="min-h-screen bg-canvas text-ink-900">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <h1 className="text-2xl font-semibold">Raghu Rokda</h1>
          {userEmail ? (
            <HeaderProfile userEmail={userEmail} monthlySalary={monthlySalary ?? 0} />
          ) : (
            <form action={signOut}>
              <button className="focus-ring rounded-md border border-line px-4 py-2 text-sm font-semibold hover:bg-canvas">
                Sign out
              </button>
            </form>
          )}
        </div>
      </header>
      {children}
    </main>
  );
}

export function DashboardLoadError({ message }: { message: string }) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-8">
      <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-danger-900">
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
