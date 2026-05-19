import type {
  DashboardBudgetItem,
  DashboardDebtItem,
  DashboardWishlistItem,
  ForecastEntry,
  ForecastResult
} from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const monthYearFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric"
});

export function formatCurrency(value: number, currency = "INR") {
  if (currency === "INR") return currencyFormatter.format(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatMonthYear(date: Date) {
  return monthYearFormatter.format(date);
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function calculateMonthlySavings(monthlySalary: number, budgetItems: DashboardBudgetItem[]) {
  const budgetTotal = budgetItems.reduce((sum, item) => sum + item.amount, 0);
  return {
    budgetTotal,
    monthlySavings: monthlySalary - budgetTotal
  };
}

function emptyForecast(id: string): ForecastEntry {
  return { id, targetDate: null, monthsFromNow: null };
}

export function buildForecast(params: {
  monthlySalary: number;
  budgetItems: DashboardBudgetItem[];
  debtItems: DashboardDebtItem[];
  wishlistItems: DashboardWishlistItem[];
  startDate?: Date;
}): ForecastResult {
  const { budgetTotal, monthlySavings } = calculateMonthlySavings(
    params.monthlySalary,
    params.budgetItems
  );
  const startDate = params.startDate ?? new Date();

  // Debts: each loan is paid down by its own monthly EMI, independently.
  // The EMI already sits in the budget, so this never touches monthlySavings.
  const debtForecasts: ForecastEntry[] = params.debtItems.map((item) => {
    const emi = item.monthly_emi;
    if (emi === null || emi <= 0) return emptyForecast(item.id);
    const monthsFromNow = Math.ceil(item.amount / emi);
    return { id: item.id, monthsFromNow, targetDate: addMonths(startDate, monthsFromNow) };
  });

  // Wishlist: funded by leftover monthly savings, active items in priority
  // order. A switched-off wish is skipped so items after it arrive sooner.
  let cumulative = 0;
  const wishlistForecasts: ForecastEntry[] = params.wishlistItems.map((item) => {
    if (!item.is_active || monthlySavings <= 0) return emptyForecast(item.id);
    cumulative += item.amount;
    const monthsFromNow = Math.ceil(cumulative / monthlySavings);
    return { id: item.id, monthsFromNow, targetDate: addMonths(startDate, monthsFromNow) };
  });

  return {
    budgetTotal,
    monthlySavings,
    debtForecasts,
    wishlistForecasts,
    debtForecastById: toMap(debtForecasts),
    wishlistForecastById: toMap(wishlistForecasts)
  };
}

function toMap(entries: ForecastEntry[]): Map<string, ForecastEntry> {
  return new Map(entries.map((entry) => [entry.id, entry]));
}
