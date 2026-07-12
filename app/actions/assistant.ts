"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchDashboardData } from "@/lib/queries";
import { extractPlannerItems } from "@/lib/ai/extract";
import { isAIConfigured } from "@/lib/ai/provider";
import { parseOrThrow } from "@/lib/zod";
import {
  budgetItemSchema,
  debtItemSchema,
  plannerKindSchema,
  wishlistItemSchema
} from "@/lib/validation";
import type { PlannerKind } from "@/lib/types";

const SCHEMA_BY_KIND = {
  budget: budgetItemSchema,
  debt: debtItemSchema,
  wishlist: wishlistItemSchema
} as const;

/** A validated item the assistant proposes to add — a superset of all tabs. */
export type ExtractedItem = {
  name: string;
  emoji: string | null;
  amount: number;
  category?: string;
  interest_rate?: number | null;
  tenure_months?: number | null;
  monthly_emi?: number | null;
  details: string | null;
};

export type ExtractResult =
  | { ok: true; items: ExtractedItem[]; skipped: number }
  | { ok: false; error: string };

/** Turns the user's free text into validated planner rows to confirm. */
export async function extractPlannerItemsAction(
  kind: PlannerKind,
  text: string
): Promise<ExtractResult> {
  if (!isAIConfigured()) {
    return { ok: false, error: "The assistant isn't configured yet." };
  }

  const tab = parseOrThrow(plannerKindSchema, kind);
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (trimmed.length === 0) return { ok: false, error: "Type what you'd like to add." };
  if (trimmed.length > 4000) return { ok: false, error: "That's too long — shorten it a bit." };

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const dashboard = await fetchDashboardData(user.id);
  const budgetCategories = dashboard.ok ? dashboard.data.budgetCategories : [];

  let raw: unknown[];
  try {
    raw = await extractPlannerItems({ tab, text: trimmed, budgetCategories });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Couldn't read those items."
    };
  }

  const schema = SCHEMA_BY_KIND[tab];
  const items: ExtractedItem[] = [];
  let skipped = 0;
  for (const candidate of raw.slice(0, 25)) {
    const result = schema.safeParse(candidate);
    if (result.success) items.push(result.data as ExtractedItem);
    else skipped += 1;
  }

  if (items.length === 0) {
    return {
      ok: false,
      error: "Couldn't find any complete items to add — try including a name and amount."
    };
  }

  return { ok: true, items, skipped };
}
