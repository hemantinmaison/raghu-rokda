import type {
  DashboardBudgetItem,
  DashboardDebtItem,
  DashboardWishlistItem,
  ForecastResult,
} from "@/lib/types";

export function formatCurrency(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric"
  }).format(date);
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
    return {
      budgetTotal,
      monthlySavings,
      debtForecasts: params.debtItems.map((item) => ({
        id: item.id,
        targetDate: null,
        monthsFromNow: null
      })),
      wishlistForecasts: params.wishlistItems.map((item) => ({
        id: item.id,
        targetDate: null,
        monthsFromNow: null
      }))
    };
  }

  let cumulativeAmount = 0;
  const startDate = params.startDate ?? new Date();

  const debtForecasts = params.debtItems.map((item) => {
    cumulativeAmount += item.amount;
    const monthsFromNow = Math.ceil(cumulativeAmount / monthlySavings);
    return {
      id: item.id,
      monthsFromNow,
      targetDate: addMonths(startDate, monthsFromNow)
    };
  });

  const wishlistForecasts = params.wishlistItems.map((item) => {
    cumulativeAmount += item.amount;
    const monthsFromNow = Math.ceil(cumulativeAmount / monthlySavings);
    return {
      id: item.id,
      monthsFromNow,
      targetDate: addMonths(startDate, monthsFromNow)
    };
  });

  return {
    budgetTotal,
    monthlySavings,
    debtForecasts,
    wishlistForecasts
  };
}
