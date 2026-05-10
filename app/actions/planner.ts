"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  budgetItemSchema,
  debtItemSchema,
  profileSchema,
  wishlistItemSchema
} from "@/lib/validation";
import type { PlannerKind } from "@/lib/types";

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

async function nextSortOrder(table: "budget_items" | "debt_items" | "wishlist_items", userId: string) {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from(table)
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.sort_order ?? -1) + 1;
}

export async function updateSalary(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = profileSchema.parse({
    monthly_salary: formData.get("monthly_salary")
  });

  await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      monthly_salary: parsed.monthly_salary,
      currency: "INR"
    },
    { onConflict: "user_id" }
  );

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

  await supabase.from("budget_items").insert({
    ...parsed,
    details: parsed.details ?? null,
    user_id: user.id,
    sort_order: await nextSortOrder("budget_items", user.id)
  });

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

  await supabase.from("debt_items").insert({
    ...parsed,
    details: parsed.details ?? null,
    user_id: user.id,
    sort_order: await nextSortOrder("debt_items", user.id)
  });

  revalidatePath("/");
}

export async function createWishlistItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = wishlistItemSchema.parse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    details: emptyToNull(formData.get("details"))
  });

  await supabase.from("wishlist_items").insert({
    ...parsed,
    details: parsed.details ?? null,
    user_id: user.id,
    sort_order: await nextSortOrder("wishlist_items", user.id)
  });

  revalidatePath("/");
}

export async function deleteItem(kind: PlannerKind, id: string) {
  const { supabase, user } = await requireUser();
  const table = tableForKind(kind);
  await supabase.from(table).delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/");
}

export async function reorderItems(kind: PlannerKind, orderedIds: string[]) {
  const { supabase, user } = await requireUser();
  const table = tableForKind(kind);

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from(table).update({ sort_order: index }).eq("id", id).eq("user_id", user.id)
    )
  );

  revalidatePath("/");
}

function tableForKind(kind: PlannerKind) {
  if (kind === "budget") return "budget_items";
  if (kind === "debt") return "debt_items";
  return "wishlist_items";
}
