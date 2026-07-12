import {
  buildForecast,
  buildPlannerSummary,
  formatCurrency,
  formatMonthYear
} from "@/lib/finance";
import type { DashboardData } from "@/lib/queries";
import type { PlannerKind } from "@/lib/types";

const TAB_LABEL: Record<PlannerKind, string> = {
  budget: "Monthly Budget",
  debt: "Debt Management",
  wishlist: "Wishlist"
};

const BASE_PROMPT = `You are the in-app money assistant for "Raghu Rokda", a personal finance planner.
You answer questions about the user's OWN data, which is given in the DATA section below.

STRICT RULES — follow exactly:
- Use ONLY the items, names, categories and amounts in the DATA section. That list is complete.
- NEVER invent, assume, or give examples of items, categories or amounts the user does not have.
- If the relevant list is empty, say plainly that they have not added anything yet and suggest they add items. Do NOT make up sample data.
- If a question cannot be answered from the DATA, say you do not have that information.
- You have all three planner sections. Synthesize across budget, debts and wishlist when the user's question asks about tradeoffs or priorities.
- All amounts are in Indian Rupees (INR). Keep answers short and practical — a few sentences or a tight bullet list.
- Do not give regulated investment, tax, or legal advice.`;

function formatPercent(value: number | null) {
  if (value === null) return "not available";
  return `${Math.round(value)}%`;
}

/** Builds the system prompt: assistant instructions + a whole-planner snapshot. */
export function buildSystemPrompt(tab: PlannerKind, data: DashboardData): string {
  const forecast = buildForecast({
    monthlySalary: data.profile.monthly_salary,
    budgetItems: data.budgetItems,
    debtItems: data.debtItems,
    wishlistItems: data.wishlistItems
  });
  const summary = buildPlannerSummary({
    monthlySalary: data.profile.monthly_salary,
    budgetItems: data.budgetItems,
    debtItems: data.debtItems,
    wishlistItems: data.wishlistItems,
    forecast
  });

  const lines: string[] = [
    BASE_PROMPT,
    "",
    "=== DATA ===",
    `The user is currently viewing the "${TAB_LABEL[tab]}" tab. Use that as UI context, but answer from the whole planner when useful.`,
    `Monthly salary: ${formatCurrency(data.profile.monthly_salary)}.`,
    `Current month: ${formatMonthYear(new Date())}.`,
    `Monthly budget total: ${formatCurrency(summary.budgetTotal)}.`,
    `Projected monthly savings: ${formatCurrency(summary.monthlySavings)} (${formatPercent(summary.savingsRatePercent)} savings rate).`,
    `Total debt: ${formatCurrency(summary.totalDebt)}. Monthly EMI total: ${formatCurrency(summary.monthlyEmiTotal)} (${formatPercent(summary.emiToSalaryPercent)} of salary).`,
    `Active wishlist total: ${formatCurrency(summary.activeWishlistTotal)} across ${summary.activeWishlistCount} active item(s).`,
    "Forecast model: monthly savings pays debts without EMI first in priority order, then active wishlist items; debts with EMI use their EMI schedule.",
    ""
  ];

  if (summary.topBudgetCategories.length > 0) {
    lines.push(
      `Top budget categories: ${summary.topBudgetCategories
        .map(
          (category) =>
            `${category.category} ${formatCurrency(category.amount)} (${formatPercent(category.percentOfBudget)})`
        )
        .join(", ")}.`
    );
  }
  lines.push("");

  appendBudgetData(lines, data);
  lines.push("");
  appendDebtData(lines, data, forecast);
  lines.push("");
  appendWishlistData(lines, data, forecast);

  lines.push("=== END DATA ===");
  return lines.join("\n");
}

function appendBudgetData(lines: string[], data: DashboardData) {
  if (data.budgetItems.length === 0) {
    lines.push("MONTHLY BUDGET: empty — the user has not added any budget items yet.");
    return;
  }

  lines.push(`MONTHLY BUDGET — ${data.budgetItems.length} item(s):`);
  for (const item of data.budgetItems) {
    const note = item.details ? `, note: ${item.details}` : "";
    lines.push(`- ${item.name} [${item.category}] — ${formatCurrency(item.amount)}${note}`);
  }
}

function appendDebtData(
  lines: string[],
  data: DashboardData,
  forecast: ReturnType<typeof buildForecast>
) {
  if (data.debtItems.length === 0) {
    lines.push("DEBT MANAGEMENT: empty — the user has not added any debts yet.");
    return;
  }

  lines.push(`DEBT MANAGEMENT — ${data.debtItems.length} item(s):`);
  for (const item of data.debtItems) {
    const interest = item.interest_rate === null ? "no rate set" : `${item.interest_rate}% interest`;
    const tenure = item.tenure_months === null ? "no tenure set" : `${item.tenure_months} months`;
    const emi = item.monthly_emi === null ? "no EMI set" : `${formatCurrency(item.monthly_emi)} EMI`;
    const payoff = forecast.debtForecastById.get(item.id)?.targetDate;
    const payoffText = payoff ? `, projected payoff ${formatMonthYear(payoff)}` : "";
    const note = item.details ? `, note: ${item.details}` : "";
    lines.push(
      `- ${item.name} — ${formatCurrency(item.amount)}, ${emi}, ${interest}, ${tenure}${payoffText}${note}`
    );
  }

  if (forecast.monthlySavings <= 0) {
    lines.push("Note: the budget meets or exceeds salary, so savings-funded payoff dates cannot be projected.");
  }
}

function appendWishlistData(
  lines: string[],
  data: DashboardData,
  forecast: ReturnType<typeof buildForecast>
) {
  if (data.wishlistItems.length === 0) {
    lines.push("WISHLIST: empty — the user has not added any wishlist items yet.");
    return;
  }

  lines.push(`WISHLIST — ${data.wishlistItems.length} item(s):`);
  for (const item of data.wishlistItems) {
    const available = forecast.wishlistForecastById.get(item.id)?.targetDate;
    const availableText = available ? `, projected affordable by ${formatMonthYear(available)}` : "";
    const status = item.is_active ? "active" : "paused";
    const note = item.details ? `, note: ${item.details}` : "";
    lines.push(`- ${item.name} — ${formatCurrency(item.amount)}, ${status}${availableText}${note}`);
  }

  if (forecast.monthlySavings <= 0) {
    lines.push("Note: the budget meets or exceeds salary, so wishlist target dates cannot be projected.");
  }
}
