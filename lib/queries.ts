import { createClient } from "@/lib/supabase/server";
import {
  normalizeBudgetItem,
  normalizeDebtItem,
  normalizeProfile,
  normalizeWishlistItem
} from "@/lib/normalize";
import type {
  DashboardBudgetItem,
  DashboardDebtItem,
  DashboardProfile,
  DashboardWishlistItem
} from "@/lib/types";

export type DashboardData = {
  profile: DashboardProfile;
  budgetItems: DashboardBudgetItem[];
  debtItems: DashboardDebtItem[];
  wishlistItems: DashboardWishlistItem[];
  budgetCategories: string[];
};

export type DashboardLoadResult =
  | { ok: true; data: DashboardData }
  | { ok: false; error: string };

export async function fetchDashboardData(userId: string): Promise<DashboardLoadResult> {
  const supabase = await createClient();

  const [profileResult, budgetResult, debtResult, wishlistResult] = await Promise.all([
    supabase.from("profiles").select("monthly_salary,currency").eq("user_id", userId).maybeSingle(),
    supabase
      .from("budget_items")
      .select("id,name,emoji,amount,category,details,sort_order")
      .eq("user_id", userId)
      .order("sort_order")
      .order("id"),
    supabase
      .from("debt_items")
      .select("id,name,emoji,amount,interest_rate,tenure_months,monthly_emi,details,sort_order")
      .eq("user_id", userId)
      .order("sort_order")
      .order("id"),
    supabase
      .from("wishlist_items")
      .select("id,name,emoji,amount,details,is_active,sort_order")
      .eq("user_id", userId)
      .order("sort_order")
      .order("id")
  ]);

  const firstError =
    profileResult.error ?? budgetResult.error ?? debtResult.error ?? wishlistResult.error;
  if (firstError) return { ok: false, error: firstError.message };

  const budgetItems = (budgetResult.data ?? []).map(normalizeBudgetItem);
  const budgetCategories = Array.from(
    new Set(budgetItems.map((item) => item.category.trim()).filter((value) => value.length > 0))
  ).sort((a, b) => a.localeCompare(b));

  return {
    ok: true,
    data: {
      profile: normalizeProfile(profileResult.data),
      budgetItems,
      debtItems: (debtResult.data ?? []).map(normalizeDebtItem),
      wishlistItems: (wishlistResult.data ?? []).map(normalizeWishlistItem),
      budgetCategories
    }
  };
}
