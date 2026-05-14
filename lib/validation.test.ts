import { describe, expect, it } from "vitest";
import {
  budgetItemSchema,
  debtItemSchema,
  profileSchema,
  uuidSchema,
  wishlistItemSchema
} from "@/lib/validation";

describe("validation", () => {
  it("uuidSchema rejects non-uuids", () => {
    expect(uuidSchema.safeParse("not-a-uuid").success).toBe(false);
    expect(uuidSchema.safeParse("00000000-0000-4000-8000-000000000000").success).toBe(true);
  });

  it("profileSchema coerces and rejects negatives", () => {
    expect(profileSchema.parse({ monthly_salary: "50000" })).toEqual({ monthly_salary: 50000 });
    expect(profileSchema.safeParse({ monthly_salary: -1 }).success).toBe(false);
  });

  it("budgetItemSchema enforces required name/amount/category", () => {
    const ok = budgetItemSchema.parse({
      name: "Rent",
      amount: "30000",
      category: "Rent",
      details: ""
    });
    expect(ok).toEqual({
      name: "Rent",
      emoji: null,
      amount: 30000,
      category: "Rent",
      details: null
    });

    expect(budgetItemSchema.safeParse({ name: "", amount: 1, category: "x" }).success).toBe(false);
    expect(budgetItemSchema.safeParse({ name: "x", amount: 0, category: "x" }).success).toBe(false);
  });

  it("debtItemSchema treats blank/null/undefined optional fields as null", () => {
    expect(
      debtItemSchema.parse({
        name: "Loan",
        amount: 5000,
        interest_rate: "",
        tenure_months: null,
        details: undefined
      })
    ).toEqual({
      name: "Loan",
      emoji: null,
      amount: 5000,
      interest_rate: null,
      tenure_months: null,
      details: null
    });

    expect(
      debtItemSchema.parse({
        name: "Loan",
        amount: 5000,
        interest_rate: "8.5",
        tenure_months: "24",
        details: "fixed"
      })
    ).toEqual({
      name: "Loan",
      emoji: null,
      amount: 5000,
      interest_rate: 8.5,
      tenure_months: 24,
      details: "fixed"
    });
  });

  it("rejects negative interest and non-integer tenure", () => {
    expect(
      debtItemSchema.safeParse({
        name: "Loan",
        amount: 1,
        interest_rate: -1,
        tenure_months: 24
      }).success
    ).toBe(false);
    expect(
      debtItemSchema.safeParse({
        name: "Loan",
        amount: 1,
        interest_rate: 1,
        tenure_months: 1.5
      }).success
    ).toBe(false);
  });

  it("wishlistItemSchema trims details and rejects oversized strings", () => {
    const big = "x".repeat(501);
    expect(wishlistItemSchema.safeParse({ name: "x", amount: 1, details: big }).success).toBe(
      false
    );
  });
});
