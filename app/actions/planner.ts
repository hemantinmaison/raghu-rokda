"use server";

import { revalidatePath } from "next/cache";
import { z, ZodError, type ZodSchema } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  budgetItemSchema,
  debtItemSchema,
  plannerKindSchema,
  profileSchema,
  uuidSchema,
  wishlistItemSchema
} from "@/lib/validation";
import type { PlannerKind } from "@/lib/types";
import type { PostgrestError } from "@supabase/supabase-js";

function parseOrThrow<T>(schema: ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues
        .map((issue) => {
          const path = issue.path.join(".");
          return path ? `${path}: ${issue.message}` : issue.message;
        })
        .join("; ");
      throw new Error(message);
    }
    throw error;
  }
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in.");
  }

  return { supabase, user };
}

function emptyToNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

function throwIfError(error: PostgrestError | null) {
  if (error) {
    throw new Error(error.message);
  }
}

export async function updateSalary(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = parseOrThrow(profileSchema, {
    monthly_salary: formData.get("monthly_salary")
  });

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      monthly_salary: parsed.monthly_salary,
      currency: "INR"
    },
    { onConflict: "user_id" }
  );

  throwIfError(error);
  revalidatePath("/");
}

export async function createBudgetItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = parseOrThrow(budgetItemSchema, {
    name: formData.get("name"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    details: emptyToNull(formData.get("details"))
  });

  const { error } = await supabase.from("budget_items").insert({
    ...parsed,
    details: parsed.details ?? null,
    user_id: user.id
  });

  throwIfError(error);
  revalidatePath("/");
}

export async function createDebtItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = parseOrThrow(debtItemSchema, {
    name: formData.get("name"),
    amount: formData.get("amount"),
    interest_rate: formData.get("interest_rate"),
    tenure_months: formData.get("tenure_months"),
    details: emptyToNull(formData.get("details"))
  });

  const { error } = await supabase.from("debt_items").insert({
    name: parsed.name,
    amount: parsed.amount,
    interest_rate: parsed.interest_rate as number | null,
    tenure_months: parsed.tenure_months as number | null,
    details: parsed.details ?? null,
    user_id: user.id
  });

  throwIfError(error);
  revalidatePath("/");
}

export async function createWishlistItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = parseOrThrow(wishlistItemSchema, {
    name: formData.get("name"),
    amount: formData.get("amount"),
    details: emptyToNull(formData.get("details"))
  });

  const { error } = await supabase.from("wishlist_items").insert({
    ...parsed,
    details: parsed.details ?? null,
    user_id: user.id
  });

  throwIfError(error);
  revalidatePath("/");
}

export async function deleteItem(kind: PlannerKind, id: string) {
  const { supabase, user } = await requireUser();
  const table = tableForKind(parseOrThrow(plannerKindSchema, kind));
  const itemId = parseOrThrow(uuidSchema, id);
  const { error } = await supabase.from(table).delete().eq("id", itemId).eq("user_id", user.id);

  throwIfError(error);
  revalidatePath("/");
}

export async function reorderItems(kind: PlannerKind, orderedIds: string[]) {
  const { supabase } = await requireUser();
  const parsedKind = parseOrThrow(plannerKindSchema, kind);
  const parsedIds = parseOrThrow(z.array(uuidSchema), orderedIds);
  if (parsedIds.length === 0) return;

  const { error } = await supabase.rpc("reorder_items", {
    p_kind: parsedKind,
    p_ids: parsedIds
  });
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}

function tableForKind(kind: PlannerKind) {
  if (kind === "budget") return "budget_items";
  if (kind === "debt") return "debt_items";
  return "wishlist_items";
}
