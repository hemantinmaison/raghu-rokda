import type { Database } from "@/lib/supabase/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type BudgetItem = Database["public"]["Tables"]["budget_items"]["Row"];
export type DebtItem = Database["public"]["Tables"]["debt_items"]["Row"];
export type WishlistItem = Database["public"]["Tables"]["wishlist_items"]["Row"];

export type PlannerKind = "budget" | "debt" | "wishlist";

export type ForecastEntry = {
  id: string;
  monthsFromNow: number | null;
  targetDate: Date | null;
};

export type ForecastResult = {
  budgetTotal: number;
  monthlySavings: number;
  debtForecasts: ForecastEntry[];
  wishlistForecasts: ForecastEntry[];
};
