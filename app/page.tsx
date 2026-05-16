import { AppShell, DashboardLoadError } from "@/components/app-shell";
import { LandingPage } from "@/components/landing-page";
import { PlannerDashboard } from "@/components/planner-dashboard";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardData } from "@/lib/queries";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return <LandingPage />;

  const userEmail = user.email ?? "Signed in";
  const result = await fetchDashboardData(user.id);

  if (!result.ok) {
    return (
      <AppShell userEmail={userEmail}>
        <DashboardLoadError message={result.error} />
      </AppShell>
    );
  }

  return (
    <AppShell userEmail={userEmail} monthlySalary={result.data.profile.monthly_salary}>
      <PlannerDashboard {...result.data} />
    </AppShell>
  );
}
