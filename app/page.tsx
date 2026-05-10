import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { PlannerDashboard } from "@/components/planner-dashboard";
import { createClient } from "@/lib/supabase/server";
import type {
  DashboardBudgetItem,
  DashboardDebtItem,
  DashboardProfile,
  DashboardWishlistItem
} from "@/lib/types";

function toNumber(value: number | string | null | undefined) {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizeProfile(profile: DashboardProfile | null): DashboardProfile {
  return {
    monthly_salary: toNumber(profile?.monthly_salary),
    currency: profile?.currency ?? "INR"
  };
}

function normalizeBudgetItem(item: DashboardBudgetItem): DashboardBudgetItem {
  return {
    ...item,
    amount: toNumber(item.amount),
    sort_order: toNumber(item.sort_order)
  };
}

function normalizeDebtItem(item: DashboardDebtItem): DashboardDebtItem {
  return {
    ...item,
    amount: toNumber(item.amount),
    interest_rate: item.interest_rate === null ? null : toNumber(item.interest_rate),
    tenure_months: item.tenure_months === null ? null : toNumber(item.tenure_months),
    sort_order: toNumber(item.sort_order)
  };
}

function normalizeWishlistItem(item: DashboardWishlistItem): DashboardWishlistItem {
  return {
    ...item,
    amount: toNumber(item.amount),
    sort_order: toNumber(item.sort_order)
  };
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileResult, budgetResult, debtResult, wishlistResult] = await Promise.all([
    supabase.from("profiles").select("monthly_salary,currency").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("budget_items")
      .select("id,name,amount,category,details,sort_order")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("debt_items")
      .select("id,name,amount,interest_rate,tenure_months,details,sort_order")
      .eq("user_id", user.id)
      .order("sort_order"),
    supabase
      .from("wishlist_items")
      .select("id,name,amount,details,sort_order")
      .eq("user_id", user.id)
      .order("sort_order")
  ]);

  const profile = normalizeProfile(profileResult.data);

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
        budgetItems={(budgetResult.data ?? []).map(normalizeBudgetItem)}
        debtItems={(debtResult.data ?? []).map(normalizeDebtItem)}
        wishlistItems={(wishlistResult.data ?? []).map(normalizeWishlistItem)}
      />
    </main>
  );
}
