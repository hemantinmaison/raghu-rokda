import type {
  DashboardBudgetItem,
  DashboardCategory,
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

function normalizeEmoji(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeBudgetItem(item: DashboardBudgetItem): DashboardBudgetItem {
  return {
    ...item,
    emoji: normalizeEmoji(item.emoji),
    amount: toNumber(item.amount),
    sort_order: toNumber(item.sort_order)
  };
}

export function normalizeCategory(category: DashboardCategory): DashboardCategory {
  return {
    ...category,
    emoji: normalizeEmoji(category.emoji),
    sort_order: toNumber(category.sort_order)
  };
}

export function normalizeDebtItem(item: DashboardDebtItem): DashboardDebtItem {
  return {
    ...item,
    emoji: normalizeEmoji(item.emoji),
    amount: toNumber(item.amount),
    interest_rate: item.interest_rate === null ? null : toNumber(item.interest_rate),
    tenure_months: item.tenure_months === null ? null : toNumber(item.tenure_months),
    monthly_emi: item.monthly_emi === null ? null : toNumber(item.monthly_emi),
    sort_order: toNumber(item.sort_order)
  };
}

export function normalizeWishlistItem(item: DashboardWishlistItem): DashboardWishlistItem {
  return {
    ...item,
    emoji: normalizeEmoji(item.emoji),
    amount: toNumber(item.amount),
    is_active: item.is_active !== false,
    sort_order: toNumber(item.sort_order)
  };
}
