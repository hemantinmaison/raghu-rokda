import { buildForecast, calculateMonthlySavings, formatCurrency, formatMonthYear } from "@/lib/finance";
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
- All amounts are in Indian Rupees (INR). Keep answers short and practical — a few sentences or a tight bullet list.
- Do not give regulated investment, tax, or legal advice.`;

/** Builds the system prompt: assistant instructions + a snapshot of the
 *  user's data, focused on whichever tab they are currently viewing. */
export function buildSystemPrompt(tab: PlannerKind, data: DashboardData): string {
  const lines: string[] = [
    BASE_PROMPT,
    "",
    "=== DATA ===",
    `The user is currently viewing the "${TAB_LABEL[tab]}" tab — focus your answer there.`,
    `Monthly salary: ${formatCurrency(data.profile.monthly_salary)}.`,
    `Current month: ${formatMonthYear(new Date())}.`,
    ""
  ];

  if (tab === "budget") {
    if (data.budgetItems.length === 0) {
      lines.push("MONTHLY BUDGET: empty — the user has not added any budget items yet.");
    } else {
      const { budgetTotal, monthlySavings } = calculateMonthlySavings(
        data.profile.monthly_salary,
        data.budgetItems
      );
      lines.push(`MONTHLY BUDGET — ${data.budgetItems.length} item(s):`);
      for (const item of data.budgetItems) {
        const note = item.details ? `, note: ${item.details}` : "";
        lines.push(`- ${item.name} [${item.category}] — ${formatCurrency(item.amount)}${note}`);
      }
      lines.push("");
      lines.push(`Total monthly budget: ${formatCurrency(budgetTotal)}.`);
      lines.push(`Projected monthly savings (salary − budget): ${formatCurrency(monthlySavings)}.`);
    }
  } else if (tab === "debt") {
    if (data.debtItems.length === 0) {
      lines.push("DEBT MANAGEMENT: empty — the user has not added any debts yet.");
    } else {
      const forecast = buildForecast({
        monthlySalary: data.profile.monthly_salary,
        budgetItems: data.budgetItems,
        debtItems: data.debtItems,
        wishlistItems: data.wishlistItems
      });
      lines.push(`DEBT MANAGEMENT — ${data.debtItems.length} item(s):`);
      for (const item of data.debtItems) {
        const interest =
          item.interest_rate === null ? "no rate set" : `${item.interest_rate}% interest`;
        const tenure =
          item.tenure_months === null ? "no tenure set" : `${item.tenure_months} months`;
        const payoff = forecast.debtForecastById.get(item.id)?.targetDate;
        const payoffText = payoff ? `, projected payoff ${formatMonthYear(payoff)}` : "";
        const note = item.details ? `, note: ${item.details}` : "";
        lines.push(
          `- ${item.name} — ${formatCurrency(item.amount)}, ${interest}, ${tenure}${payoffText}${note}`
        );
      }
      lines.push("");
      lines.push(
        `Projected monthly savings available for payoff: ${formatCurrency(forecast.monthlySavings)}.`
      );
      if (forecast.monthlySavings <= 0) {
        lines.push("Note: the budget meets or exceeds salary, so no payoff date can be projected.");
      }
    }
  } else {
    if (data.wishlistItems.length === 0) {
      lines.push("WISHLIST: empty — the user has not added any wishlist items yet.");
    } else {
      const forecast = buildForecast({
        monthlySalary: data.profile.monthly_salary,
        budgetItems: data.budgetItems,
        debtItems: data.debtItems,
        wishlistItems: data.wishlistItems
      });
      lines.push(`WISHLIST — ${data.wishlistItems.length} item(s):`);
      for (const item of data.wishlistItems) {
        const available = forecast.wishlistForecastById.get(item.id)?.targetDate;
        const availableText = available
          ? `, projected affordable by ${formatMonthYear(available)}`
          : "";
        const note = item.details ? `, note: ${item.details}` : "";
        lines.push(`- ${item.name} — ${formatCurrency(item.amount)}${availableText}${note}`);
      }
      lines.push("");
      lines.push(`Projected monthly savings available: ${formatCurrency(forecast.monthlySavings)}.`);
      if (forecast.monthlySavings <= 0) {
        lines.push("Note: the budget meets or exceeds salary, so no target date can be projected.");
      }
    }
  }

  lines.push("=== END DATA ===");
  return lines.join("\n");
}
