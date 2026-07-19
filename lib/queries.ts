import { createClient } from "@/lib/supabase/server";
import {
  normalizeBudgetItem,
  normalizeCategory,
  normalizeDebtItem,
  normalizeProfile,
  normalizeWishlistItem
} from "@/lib/normalize";
import type {
  DashboardBudgetItem,
  DashboardCategory,
  DashboardDebtItem,
  DashboardProfile,
  DashboardWishlistItem
} from "@/lib/types";

export type DashboardData = {
  profile: DashboardProfile;
  budgetItems: DashboardBudgetItem[];
  debtItems: DashboardDebtItem[];
  wishlistItems: DashboardWishlistItem[];
  categories: DashboardCategory[];
  budgetCategories: string[];
};

export type DashboardLoadResult =
  | { ok: true; data: DashboardData }
  | { ok: false; error: string };

export async function fetchDashboardData(userId: string): Promise<DashboardLoadResult> {
  const supabase = await createClient();

  const initializationResult = await supabase.rpc("ensure_user_finances");
  if (initializationResult.error) return { ok: false, error: initializationResult.error.message };

  const [profileResult, categoryResult, budgetResult, debtResult, wishlistResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("monthly_salary,working_days_per_month,working_hours_per_day,currency")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("categories")
      .select("id,name,emoji,color,sort_order")
      .eq("user_id", userId)
      .order("sort_order")
      .order("id"),
    supabase
      .from("budget_items")
      .select("id,name,emoji,amount,category_id,details,sort_order")
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
    profileResult.error ?? categoryResult.error ?? budgetResult.error ?? debtResult.error ?? wishlistResult.error;
  if (firstError) return { ok: false, error: firstError.message };

  const categories = (categoryResult.data ?? []).map(normalizeCategory);
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
  const budgetItems = (budgetResult.data ?? []).map((item) =>
    normalizeBudgetItem({
      ...item,
      category: categoryNameById.get(item.category_id) ?? "Other"
    })
  );
  const budgetCategories = categories.map((category) => category.name);

  return {
    ok: true,
    data: {
      profile: normalizeProfile(profileResult.data),
      categories,
      budgetItems,
      debtItems: (debtResult.data ?? []).map(normalizeDebtItem),
      wishlistItems: (wishlistResult.data ?? []).map(normalizeWishlistItem),
      budgetCategories
    }
  };
}
