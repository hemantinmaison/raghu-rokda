import type { Metadata } from "next";
import { redirect } from "next/navigation";
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

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("monthly_salary")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <AppShell userEmail={user.email ?? "Signed in"} monthlySalary={profile?.monthly_salary ?? 0}>
      <QuotesView />
    </AppShell>
  );
}
