"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { parseOrThrow } from "@/lib/zod";
import {
  budgetCategorySchema,
  budgetItemPatchSchema,
  budgetItemSchema,
  debtItemPatchSchema,
  debtItemSchema,
  plannerKindSchema,
  profileSchema,
  uuidSchema,
  wishlistItemPatchSchema,
  wishlistItemSchema
} from "@/lib/validation";
import type { PlannerKind } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";
import type { PostgrestError, SupabaseClient, User } from "@supabase/supabase-js";

type Supabase = SupabaseClient<Database>;
type AnyTable = "budget_items" | "debt_items" | "wishlist_items";

const TABLE_BY_KIND: Record<PlannerKind, AnyTable> = {
  budget: "budget_items",
  debt: "debt_items",
  wishlist: "wishlist_items"
};

async function requireUser(): Promise<{ supabase: Supabase; user: User }> {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be signed in.");
  return { supabase, user };
}

function readFields<K extends string>(formData: FormData, keys: readonly K[]) {
  return Object.fromEntries(keys.map((key) => [key, formData.get(key)])) as Record<K, FormDataEntryValue | null>;
}

function throwIfError(error: PostgrestError | null) {
  if (error) throw new Error(error.message);
}

const DEFAULT_EMOJIS: Record<PlannerKind, readonly string[]> = {
  budget: ["🏠", "🛒", "🧾", "💡", "🍚", "🥛", "🚿", "🪔", "🧺", "🍎", "🚌", "📱", "🧴", "🧹", "⚡", "🍳"],
  debt: ["💳", "🏦", "💸", "📉", "🧾", "💰", "📊", "🤝", "⏳", "🔁", "📋", "🪙"],
  wishlist: ["🎁", "✨", "🛍️", "🎧", "📷", "💻", "🚲", "⌚", "🪑", "🏖️", "🎮", "👟"]
};

function randomEmoji(kind: PlannerKind) {
  const pool = DEFAULT_EMOJIS[kind];
  return pool[Math.floor(Math.random() * pool.length)];
}

async function nextSortOrder(supabase: Supabase, table: AnyTable, userId: string) {
  const { data, error } = await supabase
    .from(table)
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.sort_order ?? -1) + 1;
}

export async function updateSalary(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = parseOrThrow(profileSchema, readFields(formData, ["monthly_salary"]));

  const { error } = await supabase
    .from("profiles")
    .upsert(
      { user_id: user.id, monthly_salary: parsed.monthly_salary, currency: "INR" },
      { onConflict: "user_id" }
    );

  throwIfError(error);
  revalidatePath("/");
}

export async function createBudgetItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = parseOrThrow(
    budgetItemSchema,
    readFields(formData, ["name", "emoji", "amount", "category", "details"] as const)
  );
  const sort_order = await nextSortOrder(supabase, "budget_items", user.id);
  const { error } = await supabase
    .from("budget_items")
    .insert({
      ...parsed,
      emoji: parsed.emoji ?? randomEmoji("budget"),
      user_id: user.id,
      sort_order
    });
  throwIfError(error);
  revalidatePath("/");
}

export async function updateBudgetItemCategory(id: string, category: string) {
  const { supabase, user } = await requireUser();
  const itemId = parseOrThrow(uuidSchema, id);
  const parsed = parseOrThrow(budgetCategorySchema, { category });

  const { error } = await supabase
    .from("budget_items")
    .update({ category: parsed.category })
    .eq("id", itemId)
    .eq("user_id", user.id);
  throwIfError(error);
  revalidatePath("/");
}

export async function updateBudgetItem(id: string, patch: unknown) {
  const { supabase, user } = await requireUser();
  const itemId = parseOrThrow(uuidSchema, id);
  const parsed = parseOrThrow(budgetItemPatchSchema, patch);
  if (Object.keys(parsed).length === 0) return;

  const { error } = await supabase
    .from("budget_items")
    .update(parsed)
    .eq("id", itemId)
    .eq("user_id", user.id);
  throwIfError(error);
  revalidatePath("/");
}

export async function updateDebtItem(id: string, patch: unknown) {
  const { supabase, user } = await requireUser();
  const itemId = parseOrThrow(uuidSchema, id);
  const parsed = parseOrThrow(debtItemPatchSchema, patch);
  if (Object.keys(parsed).length === 0) return;

  const { error } = await supabase
    .from("debt_items")
    .update(parsed)
    .eq("id", itemId)
    .eq("user_id", user.id);
  throwIfError(error);
  revalidatePath("/");
}

export async function updateWishlistItem(id: string, patch: unknown) {
  const { supabase, user } = await requireUser();
  const itemId = parseOrThrow(uuidSchema, id);
  const parsed = parseOrThrow(wishlistItemPatchSchema, patch);
  if (Object.keys(parsed).length === 0) return;

  const { error } = await supabase
    .from("wishlist_items")
    .update(parsed)
    .eq("id", itemId)
    .eq("user_id", user.id);
  throwIfError(error);
  revalidatePath("/");
}

export async function createDebtItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = parseOrThrow(
    debtItemSchema,
    readFields(
      formData,
      ["name", "emoji", "amount", "interest_rate", "tenure_months", "details"] as const
    )
  );
  const sort_order = await nextSortOrder(supabase, "debt_items", user.id);
  const { error } = await supabase
    .from("debt_items")
    .insert({
      ...parsed,
      emoji: parsed.emoji ?? randomEmoji("debt"),
      user_id: user.id,
      sort_order
    });
  throwIfError(error);
  revalidatePath("/");
}

export async function createWishlistItem(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = parseOrThrow(
    wishlistItemSchema,
    readFields(formData, ["name", "emoji", "amount", "details"] as const)
  );
  const sort_order = await nextSortOrder(supabase, "wishlist_items", user.id);
  const { error } = await supabase
    .from("wishlist_items")
    .insert({
      ...parsed,
      emoji: parsed.emoji ?? randomEmoji("wishlist"),
      user_id: user.id,
      sort_order
    });
  throwIfError(error);
  revalidatePath("/");
}

const MAX_BULK_ITEMS = 25;

/** Bulk-inserts assistant-extracted items after re-validating each one. */
export async function createPlannerItems(
  kind: PlannerKind,
  items: unknown
): Promise<{ inserted: number }> {
  const { supabase, user } = await requireUser();
  const parsedKind = parseOrThrow(plannerKindSchema, kind);
  if (!Array.isArray(items) || items.length === 0) return { inserted: 0 };
  const slice = items.slice(0, MAX_BULK_ITEMS);

  let sortOrder = await nextSortOrder(supabase, TABLE_BY_KIND[parsedKind], user.id);

  if (parsedKind === "budget") {
    const rows = slice.map((item) => {
      const parsed = parseOrThrow(budgetItemSchema, item);
      return {
        ...parsed,
        emoji: parsed.emoji ?? randomEmoji("budget"),
        user_id: user.id,
        sort_order: sortOrder++
      };
    });
    throwIfError((await supabase.from("budget_items").insert(rows)).error);
  } else if (parsedKind === "debt") {
    const rows = slice.map((item) => {
      const parsed = parseOrThrow(debtItemSchema, item);
      return {
        ...parsed,
        emoji: parsed.emoji ?? randomEmoji("debt"),
        user_id: user.id,
        sort_order: sortOrder++
      };
    });
    throwIfError((await supabase.from("debt_items").insert(rows)).error);
  } else {
    const rows = slice.map((item) => {
      const parsed = parseOrThrow(wishlistItemSchema, item);
      return {
        ...parsed,
        emoji: parsed.emoji ?? randomEmoji("wishlist"),
        user_id: user.id,
        sort_order: sortOrder++
      };
    });
    throwIfError((await supabase.from("wishlist_items").insert(rows)).error);
  }

  revalidatePath("/");
  return { inserted: slice.length };
}

export async function deleteItem(kind: PlannerKind, id: string) {
  const { supabase, user } = await requireUser();
  const parsedKind = parseOrThrow(plannerKindSchema, kind);
  const itemId = parseOrThrow(uuidSchema, id);

  const { error } = await supabase
    .from(TABLE_BY_KIND[parsedKind])
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id);
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
  if (error) throw new Error(error.message);
  revalidatePath("/");
}
