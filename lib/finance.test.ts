import { describe, expect, it } from "vitest";
import {
  buildForecast,
  buildPlannerSummary,
  calculateMonthlySavings,
  formatMonthYear,
  simulateLoanPayoff
} from "@/lib/finance";
import type { DashboardBudgetItem, DebtItem, WishlistItem } from "@/lib/types";

const base = {
  user_id: "user-1",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  sort_order: 0
};

function budget(overrides: Partial<DashboardBudgetItem>): DashboardBudgetItem {
  return {
    ...base,
    id: "budget-1",
    name: "Rent",
    emoji: null,
    amount: 30000,
    category_id: "category-1",
    category: "Rent",
    details: null,
    ...overrides
  };
}

function debt(overrides: Partial<DebtItem>): DebtItem {
  return {
    ...base,
    id: "debt-1",
    name: "Loan",
    emoji: null,
    amount: 50000,
    interest_rate: null,
    tenure_months: null,
    monthly_emi: null,
    details: null,
    ...overrides
  };
}

function wishlist(overrides: Partial<WishlistItem>): WishlistItem {
  return {
    ...base,
    id: "wish-1",
    name: "Laptop",
    emoji: null,
    amount: 40000,
    details: null,
    is_active: true,
    ...overrides
  };
}

describe("finance forecasting", () => {
  it("calculates savings from salary minus budget item total", () => {
    const result = calculateMonthlySavings(100000, [
      budget({ id: "rent", amount: 30000 }),
      budget({ id: "food", amount: 15000 })
    ]);

    expect(result.budgetTotal).toBe(45000);
    expect(result.monthlySavings).toBe(55000);
  });

  it("forecasts debt payoff from its EMI and wishlist from savings", () => {
    const forecast = buildForecast({
      monthlySalary: 100000,
      budgetItems: [budget({ amount: 50000 })],
      // 75000 ÷ 25000 EMI = 3 months → Feb 2027
      debtItems: [debt({ id: "loan", amount: 75000, monthly_emi: 25000 })],
      // savings 50000; 100000 ÷ 50000 = 2 months → Jan 2027
      wishlistItems: [wishlist({ id: "bike", amount: 100000 })],
      startDate: new Date(2026, 10, 1)
    });

    expect(formatMonthYear(forecast.debtForecasts[0].targetDate!)).toBe("February 2027");
    expect(formatMonthYear(forecast.wishlistForecasts[0].targetDate!)).toBe("January 2027");
  });

  it("forecasts a debt without an EMI from leftover savings", () => {
    const forecast = buildForecast({
      monthlySalary: 100000,
      budgetItems: [budget({ amount: 40000 })], // savings = 60000
      // no EMI → 120000 ÷ 60000 savings = 2 months
      debtItems: [debt({ id: "loan", amount: 120000, monthly_emi: null })],
      wishlistItems: [],
      startDate: new Date(2026, 0, 1)
    });

    expect(forecast.debtForecastById.get("loan")?.monthsFromNow).toBe(2);
  });

  it("returns no projected dates when savings are zero or negative", () => {
    const forecast = buildForecast({
      monthlySalary: 40000,
      budgetItems: [budget({ amount: 45000 })],
      debtItems: [debt({})],
      wishlistItems: [wishlist({})],
      startDate: new Date(2026, 0, 1)
    });

    expect(forecast.monthlySavings).toBe(-5000);
    expect(forecast.debtForecasts[0].targetDate).toBeNull();
    expect(forecast.wishlistForecasts[0].targetDate).toBeNull();
  });

  it("exposes forecasts keyed by id for fast lookup", () => {
    const forecast = buildForecast({
      monthlySalary: 100000,
      budgetItems: [],
      debtItems: [debt({ id: "loan", amount: 50000, monthly_emi: 50000 })],
      wishlistItems: [wishlist({ id: "bike", amount: 100000 })],
      startDate: new Date(2026, 0, 1)
    });

    expect(forecast.debtForecastById.get("loan")?.monthsFromNow).toBe(1);
    expect(forecast.wishlistForecastById.get("bike")?.monthsFromNow).toBe(1);
  });

  it("summarizes savings, category spend, debt pressure and wishlist affordability", () => {
    const forecast = buildForecast({
      monthlySalary: 100000,
      budgetItems: [
        budget({ id: "rent", amount: 30000, category: "Housing" }),
        budget({ id: "food", amount: 20000, category: "Food" }),
        budget({ id: "dining", amount: 10000, category: "Food" })
      ],
      debtItems: [
        debt({ id: "home-loan", amount: 500000, monthly_emi: 12000 }),
        debt({ id: "card", amount: 30000, monthly_emi: null })
      ],
      wishlistItems: [
        wishlist({ id: "laptop", amount: 40000 }),
        wishlist({ id: "paused", amount: 20000, is_active: false })
      ],
      startDate: new Date(2026, 0, 1)
    });

    const summary = buildPlannerSummary({
      monthlySalary: 100000,
      budgetItems: [
        budget({ id: "rent", amount: 30000, category: "Housing" }),
        budget({ id: "food", amount: 20000, category: "Food" }),
        budget({ id: "dining", amount: 10000, category: "Food" })
      ],
      debtItems: [
        debt({ id: "home-loan", amount: 500000, monthly_emi: 12000 }),
        debt({ id: "card", amount: 30000, monthly_emi: null })
      ],
      wishlistItems: [
        wishlist({ id: "laptop", amount: 40000 }),
        wishlist({ id: "paused", amount: 20000, is_active: false })
      ],
      forecast
    });

    expect(summary.monthlySavings).toBe(40000);
    expect(summary.savingsRatePercent).toBe(40);
    expect(summary.topBudgetCategories[0]).toMatchObject({
      category: "Food",
      amount: 30000,
      percentOfBudget: 50
    });
    expect(summary.totalDebt).toBe(530000);
    expect(summary.monthlyEmiTotal).toBe(12000);
    expect(summary.emiToSalaryPercent).toBe(12);
    expect(summary.activeWishlistCount).toBe(1);
    expect(summary.activeWishlistTotal).toBe(40000);
    expect(summary.nextWishlist?.id).toBe("laptop");
  });
});

describe("loan payoff", () => {
  it("clears an interest-free loan over whole payments", () => {
    const result = simulateLoanPayoff(12000, 0, 1000);
    expect(result.cleared).toBe(true);
    expect(result.months).toBe(12);
    expect(result.totalInterest).toBe(0);
  });

  it("flags a loan whose payment cannot cover the interest", () => {
    // 100000 at 12%/yr → 1000 interest the first month, payment is only 500
    const result = simulateLoanPayoff(100000, 12, 500);
    expect(result.cleared).toBe(false);
    expect(Number.isFinite(result.months)).toBe(false);
  });

  it("charges interest and a bigger payment clears it faster with less interest", () => {
    const slow = simulateLoanPayoff(100000, 12, 10000);
    const fast = simulateLoanPayoff(100000, 12, 20000);
    expect(slow.cleared).toBe(true);
    expect(slow.totalInterest).toBeGreaterThan(0);
    expect(fast.months).toBeLessThan(slow.months);
    expect(fast.totalInterest).toBeLessThan(slow.totalInterest);
  });
});
