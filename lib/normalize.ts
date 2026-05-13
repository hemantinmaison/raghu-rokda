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

export function normalizeProfile(profile: DashboardProfile | null): DashboardProfile {
  return {
    monthly_salary: toNumber(profile?.monthly_salary),
    currency: profile?.currency ?? "INR"
  };
}

export function normalizeBudgetItem(item: DashboardBudgetItem): DashboardBudgetItem {
  return {
    ...item,
    amount: toNumber(item.amount),
    sort_order: toNumber(item.sort_order)
  };
}

export function normalizeDebtItem(item: DashboardDebtItem): DashboardDebtItem {
  return {
    ...item,
    amount: toNumber(item.amount),
    interest_rate: item.interest_rate === null ? null : toNumber(item.interest_rate),
    tenure_months: item.tenure_months === null ? null : toNumber(item.tenure_months),
    sort_order: toNumber(item.sort_order)
  };
}

export function normalizeWishlistItem(item: DashboardWishlistItem): DashboardWishlistItem {
  return {
    ...item,
    amount: toNumber(item.amount),
    sort_order: toNumber(item.sort_order)
  };
}
