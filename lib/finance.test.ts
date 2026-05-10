import { describe, expect, it } from "vitest";
import { buildForecast, calculateMonthlySavings, formatMonthYear } from "@/lib/finance";
import type { BudgetItem, DebtItem, WishlistItem } from "@/lib/types";

const base = {
  user_id: "user-1",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  sort_order: 0
};

function budget(overrides: Partial<BudgetItem>): BudgetItem {
  return {
    ...base,
    id: "budget-1",
    name: "Rent",
    amount: 30000,
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
    amount: 50000,
    interest_rate: null,
    tenure_months: null,
    details: null,
    ...overrides
  };
}

function wishlist(overrides: Partial<WishlistItem>): WishlistItem {
  return {
    ...base,
    id: "wish-1",
    name: "Laptop",
    amount: 40000,
    details: null,
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

  it("projects debt first and wishlist after debt across year boundaries", () => {
    const forecast = buildForecast({
      monthlySalary: 100000,
      budgetItems: [budget({ amount: 50000 })],
      debtItems: [debt({ id: "loan", amount: 75000 })],
      wishlistItems: [wishlist({ id: "bike", amount: 100000 })],
      startDate: new Date(2026, 10, 1)
    });

    expect(formatMonthYear(forecast.debtForecasts[0].targetDate!)).toBe("January 2027");
    expect(formatMonthYear(forecast.wishlistForecasts[0].targetDate!)).toBe("March 2027");
  });

  it("returns no projected dates when savings are zero or negative", () => {
    const forecast = buildForecast({
      monthlySalary: 40000,
      budgetItems: [budget({ amount: 45000 })],
      debtItems: [debt({})],
      wishlistItems: [wishlist({})]
    });

    expect(forecast.monthlySavings).toBe(-5000);
    expect(forecast.debtForecasts[0].targetDate).toBeNull();
    expect(forecast.wishlistForecasts[0].targetDate).toBeNull();
  });
});
