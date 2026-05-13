import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const plannerKindSchema = z.enum(["budget", "debt", "wishlist"]);

// Free-text categories are allowed (datalist is just hints) but bounded to keep
// the column tidy and prevent abusive payloads.
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

const blankToNull = (value: unknown): unknown =>
  value === "" || value === null || value === undefined ? null : value;

const optionalNumber = z.preprocess(
  blankToNull,
  z.union([z.null(), z.coerce.number().finite().nonnegative()])
);

const optionalPositiveInteger = z.preprocess(
  blankToNull,
  z.union([z.null(), z.coerce.number().int().positive()])
);

export const profileSchema = z.object({
  monthly_salary: z.coerce.number().finite().min(0, "Salary cannot be negative")
});

const nameField = z.string().trim().min(1, "Name is required").max(120, "Name is too long");
const detailsField = z.string().trim().max(500, "Details are too long").nullable().optional();
const categoryField = z
  .string()
  .trim()
  .min(1, "Category is required")
  .max(60, "Category is too long");

export const budgetItemSchema = z.object({
  name: nameField,
  amount: money,
  category: categoryField,
  details: detailsField
});

export const debtItemSchema = z.object({
  name: nameField,
  amount: money,
  interest_rate: optionalNumber,
  tenure_months: optionalPositiveInteger,
  details: detailsField
});

export const wishlistItemSchema = z.object({
  name: nameField,
  amount: money,
  details: detailsField
});
