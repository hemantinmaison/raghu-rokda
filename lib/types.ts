import type { Database } from "@/lib/supabase/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type BudgetItem = Database["public"]["Tables"]["budget_items"]["Row"];
export type DebtItem = Database["public"]["Tables"]["debt_items"]["Row"];
export type WishlistItem = Database["public"]["Tables"]["wishlist_items"]["Row"];

export type PlannerKind = "budget" | "debt" | "wishlist";

export type DashboardProfile = Pick<
  Profile,
  "monthly_salary" | "working_days_per_month" | "working_hours_per_day" | "currency"
>;
export type DashboardCategory = Pick<
  Category,
  "id" | "name" | "emoji" | "color" | "sort_order"
>;
export type DashboardBudgetItem = Pick<
  BudgetItem,
  "id" | "name" | "emoji" | "amount" | "category_id" | "details" | "sort_order"
> & {
  category: string;
};
export type DashboardDebtItem = Pick<
  DebtItem,
  | "id"
  | "name"
  | "emoji"
  | "amount"
  | "interest_rate"
  | "tenure_months"
  | "monthly_emi"
  | "details"
  | "sort_order"
>;
export type DashboardWishlistItem = Pick<
  WishlistItem,
  "id" | "name" | "emoji" | "amount" | "details" | "is_active" | "sort_order"
>;

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
  debtForecastById: Map<string, ForecastEntry>;
  wishlistForecastById: Map<string, ForecastEntry>;
};
