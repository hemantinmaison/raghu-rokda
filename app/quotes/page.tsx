import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { QuotesView } from "@/components/quotes-view";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Money wisdom — Raghu Rokda",
  description: "Quotes on debt, financial freedom, earning, and how money works."
};

export default async function QuotesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: countRows } = await supabase.rpc("quote_like_counts");
  const likeCounts: Record<string, number> = {};
  for (const row of countRows ?? []) {
    likeCounts[row.quote_id] = Number(row.like_count);
  }

  let monthlySalary = 0;
  let workingDaysPerMonth = 22;
  let workingHoursPerDay = 8;
  let likedIds: string[] = [];
  if (user) {
    const [profileResult, likesResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("monthly_salary,working_days_per_month,working_hours_per_day")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("quote_likes").select("quote_id").eq("user_id", user.id)
    ]);
    monthlySalary = profileResult.data?.monthly_salary ?? 0;
    workingDaysPerMonth = profileResult.data?.working_days_per_month ?? 22;
    workingHoursPerDay = profileResult.data?.working_hours_per_day ?? 8;
    likedIds = (likesResult.data ?? []).map((row) => row.quote_id);
  }

  return (
    <AppShell
      userEmail={user?.email ?? undefined}
      monthlySalary={monthlySalary}
      workingDaysPerMonth={workingDaysPerMonth}
      workingHoursPerDay={workingHoursPerDay}
    >
      <QuotesView
        isAuthenticated={Boolean(user)}
        likeCounts={likeCounts}
        likedIds={likedIds}
      />
    </AppShell>
  );
}
