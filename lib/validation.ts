import { z } from "zod";

const money = z.coerce.number().finite().positive("Amount must be greater than zero");
const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().finite().nonnegative().nullable()
);
const optionalPositiveInteger = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().int().positive().nullable()
);

export const profileSchema = z.object({
  monthly_salary: z.coerce.number().finite().min(0, "Salary cannot be negative")
});

export const budgetItemSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  amount: money,
  category: z.string().trim().min(1, "Category is required"),
  details: z.string().trim().nullable().optional()
});

export const debtItemSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  amount: money,
  interest_rate: optionalNumber,
  tenure_months: optionalPositiveInteger,
  details: z.string().trim().nullable().optional()
});

export const wishlistItemSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  amount: money,
  details: z.string().trim().nullable().optional()
});
