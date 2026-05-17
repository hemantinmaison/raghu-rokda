import { generateText } from "ai";
import { getLanguageModel } from "./provider";
import type { PlannerKind } from "@/lib/types";

const TAB_LABEL: Record<PlannerKind, string> = {
  budget: "Monthly Budget",
  debt: "Debt Management",
  wishlist: "Wishlist"
};

const ITEM_SHAPE: Record<PlannerKind, string> = {
  budget:
    '{ "name": string, "emoji": string|null, "amount": number, "category": string, "details": string|null }',
  debt:
    '{ "name": string, "emoji": string|null, "amount": number, "interest_rate": number|null, "tenure_months": number|null, "details": string|null }',
  wishlist: '{ "name": string, "emoji": string|null, "amount": number, "details": string|null }'
};

/** Asks the model to turn free text into structured planner rows.
 *  Returns the raw parsed JSON array — caller validates each element. */
export async function extractPlannerItems(params: {
  tab: PlannerKind;
  text: string;
  budgetCategories: string[];
}): Promise<unknown[]> {
  const { tab, text, budgetCategories } = params;

  const rules = [
    `Extract every distinct line item the user describes for their "${TAB_LABEL[tab]}".`,
    "name: a short, clear label.",
    "amount: a positive number in Indian Rupees — digits only, no symbols, commas or words.",
    "emoji: one single relevant emoji character, or null if unsure.",
    "details: any extra note the user gave, otherwise null."
  ];
  if (tab === "budget") {
    rules.push(
      budgetCategories.length > 0
        ? `category: reuse one of these when it fits — [${budgetCategories.join(", ")}] — otherwise pick a short sensible category.`
        : "category: pick a short, sensible category for the item."
    );
  }
  if (tab === "debt") {
    rules.push(
      "interest_rate: yearly interest percent as a number, or null if not stated.",
      "tenure_months: loan length in whole months, or null if not stated."
    );
  }

  const system = `You convert the user's message into structured rows for a personal finance planner.
Respond with ONLY a JSON array — no prose, no explanation, no markdown code fences.
Each array element MUST be an object of exactly this shape:
${ITEM_SHAPE[tab]}

Rules:
${rules.map((rule) => `- ${rule}`).join("\n")}

If the message contains no addable items, respond with exactly: []`;

  const { text: raw } = await generateText({
    model: getLanguageModel(),
    system,
    messages: [{ role: "user", content: text }],
    temperature: 0,
    maxOutputTokens: 900
  });

  return parseJsonArray(raw);
}

function parseJsonArray(raw: string): unknown[] {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("The assistant did not return a usable list of items.");
  }

  const parsed: unknown = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(parsed)) {
    throw new Error("The assistant did not return a list.");
  }
  return parsed;
}
