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

export type BudgetCategorySummary = {
  category: string;
  amount: number;
  percentOfBudget: number;
};

export type NextWishlistSummary = {
  id: string;
  name: string;
  amount: number;
  monthsFromNow: number | null;
  targetDate: Date | null;
};

export type PlannerSummary = {
  budgetTotal: number;
  monthlySavings: number;
  savingsRatePercent: number | null;
  topBudgetCategories: BudgetCategorySummary[];
  totalDebt: number;
  monthlyEmiTotal: number;
  emiToSalaryPercent: number | null;
  activeWishlistCount: number;
  activeWishlistTotal: number;
  nextWishlist: NextWishlistSummary | null;
};

function percentOf(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return (numerator / denominator) * 100;
}

export function buildPlannerSummary(params: {
  monthlySalary: number;
  budgetItems: DashboardBudgetItem[];
  debtItems: DashboardDebtItem[];
  wishlistItems: DashboardWishlistItem[];
  forecast?: ForecastResult;
  startDate?: Date;
}): PlannerSummary {
  const { budgetTotal, monthlySavings } = calculateMonthlySavings(
    params.monthlySalary,
    params.budgetItems
  );
  const categoryTotals = new Map<string, number>();
  for (const item of params.budgetItems) {
    const category = item.category.trim() || "Uncategorized";
    categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + item.amount);
  }

  const topBudgetCategories = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentOfBudget: percentOf(amount, budgetTotal) ?? 0
    }))
    .sort((a, b) => b.amount - a.amount || a.category.localeCompare(b.category))
    .slice(0, 3);

  const totalDebt = params.debtItems.reduce((sum, item) => sum + item.amount, 0);
  const monthlyEmiTotal = params.debtItems.reduce(
    (sum, item) => sum + (item.monthly_emi ?? 0),
    0
  );
  const activeWishlistItems = params.wishlistItems.filter((item) => item.is_active);
  const activeWishlistTotal = activeWishlistItems.reduce((sum, item) => sum + item.amount, 0);
  const forecast =
    params.forecast ??
    buildForecast({
      monthlySalary: params.monthlySalary,
      budgetItems: params.budgetItems,
      debtItems: params.debtItems,
      wishlistItems: params.wishlistItems,
      startDate: params.startDate
    });

  const nextWishlist =
    activeWishlistItems
      .map((item) => {
        const entry = forecast.wishlistForecastById.get(item.id);
        return {
          id: item.id,
          name: item.name,
          amount: item.amount,
          monthsFromNow: entry?.monthsFromNow ?? null,
          targetDate: entry?.targetDate ?? null
        };
      })
      .filter((item) => item.targetDate !== null)
      .sort((a, b) => {
        const aTime = a.targetDate?.getTime() ?? Number.POSITIVE_INFINITY;
        const bTime = b.targetDate?.getTime() ?? Number.POSITIVE_INFINITY;
        return aTime - bTime;
      })[0] ?? null;

  return {
    budgetTotal,
    monthlySavings,
    savingsRatePercent: percentOf(monthlySavings, params.monthlySalary),
    topBudgetCategories,
    totalDebt,
    monthlyEmiTotal,
    emiToSalaryPercent: percentOf(monthlyEmiTotal, params.monthlySalary),
    activeWishlistCount: activeWishlistItems.length,
    activeWishlistTotal,
    nextWishlist
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

  // A shared savings pool: debts without a fixed EMI are cleared first (in
  // priority order), then wishlist items — both funded by leftover savings.
  let cumulative = 0;

  // Debts: a debt with a monthly EMI is paid on its own EMI schedule (that EMI
  // already sits in the budget). A debt without an EMI is paid down from
  // leftover monthly savings, just like the wishlist.
  const debtForecasts: ForecastEntry[] = params.debtItems.map((item) => {
    const emi = item.monthly_emi;
    if (emi !== null && emi > 0) {
      const monthsFromNow = Math.ceil(item.amount / emi);
      return { id: item.id, monthsFromNow, targetDate: addMonths(startDate, monthsFromNow) };
    }
    if (monthlySavings <= 0) return emptyForecast(item.id);
    cumulative += item.amount;
    const monthsFromNow = Math.ceil(cumulative / monthlySavings);
    return { id: item.id, monthsFromNow, targetDate: addMonths(startDate, monthsFromNow) };
  });

  // Wishlist: funded by leftover monthly savings, after the non-EMI debts.
  // A switched-off wish is skipped so items after it arrive sooner.
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

export type LoanPayoff = {
  /** Number of monthly payments to clear the balance. */
  months: number;
  /** Total interest paid over the life of the loan. */
  totalInterest: number;
  /** Total amount paid (principal + interest). */
  totalPaid: number;
  /** False when the payment can't even cover the monthly interest. */
  cleared: boolean;
};

/**
 * Month-by-month amortisation. Given an outstanding `balance`, an annual
 * interest rate, and a fixed `monthlyPayment`, works out how long the loan
 * takes to clear and how much interest it costs.
 */
export function simulateLoanPayoff(
  balance: number,
  annualRatePercent: number,
  monthlyPayment: number
): LoanPayoff {
  if (balance <= 0) return { months: 0, totalInterest: 0, totalPaid: 0, cleared: true };
  if (monthlyPayment <= 0) {
    return { months: Infinity, totalInterest: Infinity, totalPaid: Infinity, cleared: false };
  }

  const monthlyRate = annualRatePercent / 100 / 12;

  if (monthlyRate <= 0) {
    const months = Math.ceil(balance / monthlyPayment);
    return { months, totalInterest: 0, totalPaid: balance, cleared: true };
  }

  // If the payment doesn't beat the first month's interest, it never clears.
  if (monthlyPayment <= balance * monthlyRate) {
    return { months: Infinity, totalInterest: Infinity, totalPaid: Infinity, cleared: false };
  }

  let remaining = balance;
  let months = 0;
  let totalInterest = 0;
  const MAX_MONTHS = 1200;

  while (remaining > 0 && months < MAX_MONTHS) {
    const interest = remaining * monthlyRate;
    totalInterest += interest;
    remaining = remaining + interest - monthlyPayment;
    months += 1;
  }

  return {
    months,
    totalInterest,
    totalPaid: balance + totalInterest,
    cleared: true
  };
}

/** Formats a month count as "11 yr 4 mo". */
export function formatDuration(months: number): string {
  if (!Number.isFinite(months) || months <= 0) return "0 mo";
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr`);
  if (remainder > 0) parts.push(`${remainder} mo`);
  return parts.join(" ") || "0 mo";
}
