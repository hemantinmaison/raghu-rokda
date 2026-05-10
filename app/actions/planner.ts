"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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

async function nextSortOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "budget_items" | "debt_items" | "wishlist_items",
  userId: string
) {
  const { data, error } = await supabase
    .from(table)
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  throwIfError(error);
  return (data?.sort_order ?? -1) + 1;
}

export async function updateSalary(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = profileSchema.parse({
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
  const parsed = budgetItemSchema.parse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    details: emptyToNull(formData.get("details"))
  });

  const { error } = await supabase.from("budget_items").insert({
    ...parsed,
    details: parsed.details ?? null,
    user_id: user.id,
    sort_order: await nextSortOrder(supabase, "budget_items", user.id)
  });

  throwIfError(error);
  revalidatePath("/");
}

export async function createDebtItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = debtItemSchema.parse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    interest_rate: formData.get("interest_rate"),
    tenure_months: formData.get("tenure_months"),
    details: emptyToNull(formData.get("details"))
  });

  const { error } = await supabase.from("debt_items").insert({
    ...parsed,
    details: parsed.details ?? null,
    user_id: user.id,
    sort_order: await nextSortOrder(supabase, "debt_items", user.id)
  });

  throwIfError(error);
  revalidatePath("/");
}

export async function createWishlistItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = wishlistItemSchema.parse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    details: emptyToNull(formData.get("details"))
  });

  const { error } = await supabase.from("wishlist_items").insert({
    ...parsed,
    details: parsed.details ?? null,
    user_id: user.id,
    sort_order: await nextSortOrder(supabase, "wishlist_items", user.id)
  });

  throwIfError(error);
  revalidatePath("/");
}

export async function deleteItem(kind: PlannerKind, id: string) {
  const { supabase, user } = await requireUser();
  const table = tableForKind(plannerKindSchema.parse(kind));
  const itemId = uuidSchema.parse(id);
  const { error } = await supabase.from(table).delete().eq("id", itemId).eq("user_id", user.id);

  throwIfError(error);
  revalidatePath("/");
}

export async function reorderItems(kind: PlannerKind, orderedIds: string[]) {
  const { supabase, user } = await requireUser();
  const parsedKind = plannerKindSchema.parse(kind);
  const parsedIds = z.array(uuidSchema).parse(orderedIds);
  const table = tableForKind(parsedKind);

  const results = await Promise.all(
    parsedIds.map((id, index) =>
      supabase.from(table).update({ sort_order: index }).eq("id", id).eq("user_id", user.id)
    )
  );
  results.forEach(({ error }) => throwIfError(error));

  revalidatePath("/");
}

function tableForKind(kind: PlannerKind) {
  if (kind === "budget") return "budget_items";
  if (kind === "debt") return "debt_items";
  return "wishlist_items";
}
