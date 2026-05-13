import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const plannerKindSchema = z.enum(["budget", "debt", "wishlist"]);

// Free-text categories are allowed (datalist is just hints) but bounded.
export const BUDGET_CATEGORY_SUGGESTIONS = [
  "Rent",
  "Groceries",
  "Transport",
  "Utilities",
  "Insurance",
  "Healthcare",
  "Education",
  "Subscriptions",
  "Family",
  "Other"
] as const;

const money = z.coerce.number().finite().positive("Amount must be greater than zero");

// Zod's `z.preprocess` infers `unknown`, and chained transforms don't propagate
// their output through `z.object` field inference. The `z.ZodType` annotation
// pins the public input/output so consumers see `number | null` after parsing.
const optionalNonNegativeNumber: z.ZodType<number | null, z.ZodTypeDef, unknown> = z
  .preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.union([z.null(), z.coerce.number().finite().nonnegative()])
  );

const optionalPositiveInteger: z.ZodType<number | null, z.ZodTypeDef, unknown> = z
  .preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.union([z.null(), z.coerce.number().int().positive()])
  );

const nameField = z.string().trim().min(1, "Name is required").max(120, "Name is too long");
const detailsField = z
  .string()
  .trim()
  .max(500, "Details are too long")
  .nullable()
  .optional()
  .transform((v): string | null => (v === undefined || v === null || v === "" ? null : v));
const categoryField = z
  .string()
  .trim()
  .min(1, "Category is required")
  .max(60, "Category is too long");

export type ProfileInput = { monthly_salary: number };
export type BudgetItemInput = {
  name: string;
  amount: number;
  category: string;
  details: string | null;
};
export type DebtItemInput = {
  name: string;
  amount: number;
  interest_rate: number | null;
  tenure_months: number | null;
  details: string | null;
};
export type WishlistItemInput = {
  name: string;
  amount: number;
  details: string | null;
};

export const profileSchema: z.ZodType<ProfileInput, z.ZodTypeDef, unknown> = z.object({
  monthly_salary: z.coerce.number().finite().min(0, "Salary cannot be negative")
});

export const budgetItemSchema: z.ZodType<BudgetItemInput, z.ZodTypeDef, unknown> = z.object({
  name: nameField,
  amount: money,
  category: categoryField,
  details: detailsField
});

export const debtItemSchema: z.ZodType<DebtItemInput, z.ZodTypeDef, unknown> = z.object({
  name: nameField,
  amount: money,
  interest_rate: optionalNonNegativeNumber,
  tenure_months: optionalPositiveInteger,
  details: detailsField
});

export const wishlistItemSchema: z.ZodType<WishlistItemInput, z.ZodTypeDef, unknown> = z.object({
  name: nameField,
  amount: money,
  details: detailsField
});
