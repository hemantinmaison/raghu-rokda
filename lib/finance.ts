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

  if (monthlySavings <= 0) {
    const debtForecasts = params.debtItems.map((item) => emptyForecast(item.id));
    const wishlistForecasts = params.wishlistItems.map((item) => emptyForecast(item.id));
    return {
      budgetTotal,
      monthlySavings,
      debtForecasts,
      wishlistForecasts,
      debtForecastById: toMap(debtForecasts),
      wishlistForecastById: toMap(wishlistForecasts)
    };
  }

  const startDate = params.startDate ?? new Date();
  let cumulativeAmount = 0;

  const project = <T extends { id: string; amount: number }>(
    items: T[],
    isActive?: (item: T) => boolean
  ): ForecastEntry[] =>
    items.map((item) => {
      // Skipped items (e.g. switched-off wishes) stay in the list but do not
      // consume savings, so items after them are reached sooner.
      if (isActive && !isActive(item)) return emptyForecast(item.id);
      cumulativeAmount += item.amount;
      const monthsFromNow = Math.ceil(cumulativeAmount / monthlySavings);
      return {
        id: item.id,
        monthsFromNow,
        targetDate: addMonths(startDate, monthsFromNow)
      };
    });

  const debtForecasts = project(params.debtItems);
  const wishlistForecasts = project(params.wishlistItems, (item) => item.is_active);

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
