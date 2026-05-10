import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { PlannerDashboard } from "@/components/planner-dashboard";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileResult, budgetResult, debtResult, wishlistResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("budget_items").select("*").eq("user_id", user.id).order("sort_order"),
    supabase.from("debt_items").select("*").eq("user_id", user.id).order("sort_order"),
    supabase.from("wishlist_items").select("*").eq("user_id", user.id).order("sort_order")
  ]);

  const profile =
    profileResult.data ??
    ({
      id: "local-profile",
      user_id: user.id,
      monthly_salary: 0,
      currency: "INR",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as const);

  return (
    <main className="min-h-screen bg-[#f7f8f3] text-[#171a1f]">
      <header className="border-b border-[#dde2dc] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              Finance Planner
            </p>
            <h1 className="text-2xl font-semibold">Personal cashflow dashboard</h1>
          </div>
          <form action={signOut}>
            <button className="focus-ring rounded-md border border-[#dde2dc] px-4 py-2 text-sm font-semibold hover:bg-[#f7f8f3]">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <PlannerDashboard
        profile={profile}
        userEmail={user.email ?? "Signed in"}
        budgetItems={budgetResult.data ?? []}
        debtItems={debtResult.data ?? []}
        wishlistItems={wishlistResult.data ?? []}
      />
    </main>
  );
}
