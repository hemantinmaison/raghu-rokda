import {
  CalendarCheck,
  Gauge,
  PiggyBank,
  Tags
} from "lucide-react";
import type { ReactNode } from "react";
import {
  formatCurrency,
  formatMonthYear,
  type BudgetCategorySummary,
  type PlannerSummary
} from "@/lib/finance";

function formatPercent(value: number | null) {
  if (value === null) return "—";
  return `${Math.round(value)}%`;
}

function signedCurrency(value: number) {
  if (value === 0) return formatCurrency(0);
  return `${value > 0 ? "+" : "-"}${formatCurrency(Math.abs(value))}`;
}

function savingsTone(value: number) {
  if (value < 0) return "text-danger-700";
  if (value > 0) return "text-brand-700";
  return "text-ink-700";
}

function categoryDetail(categories: BudgetCategorySummary[]) {
  const top = categories[0];
  if (!top) return "No budget items yet";
  return `${formatCurrency(top.amount)} · ${formatPercent(top.percentOfBudget)} of budget`;
}

export function DashboardSummary({ summary }: { summary: PlannerSummary }) {
  const savingsLabel =
    summary.monthlySavings >= 0
      ? `${signedCurrency(summary.monthlySavings)} left monthly`
      : `${signedCurrency(summary.monthlySavings)} over salary`;

  const debtDetail =
    summary.totalDebt === 0
      ? "No debts added"
      : summary.monthlyEmiTotal > 0
        ? `${formatCurrency(summary.monthlyEmiTotal)} EMI · ${formatPercent(summary.emiToSalaryPercent)} of salary`
        : "No monthly EMI set";

  const wishlistDetail =
    summary.activeWishlistCount === 0
      ? "No active wishlist items"
      : summary.nextWishlist?.targetDate
        ? `Next: ${summary.nextWishlist.name} by ${formatMonthYear(summary.nextWishlist.targetDate)}`
        : summary.monthlySavings <= 0
          ? "Needs positive monthly savings"
          : "Waiting on debt payoff first";

  return (
    <section aria-label="Planner summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        icon={<PiggyBank className="size-4" />}
        label="Savings rate"
        value={formatPercent(summary.savingsRatePercent)}
        detail={savingsLabel}
        valueClassName={savingsTone(summary.monthlySavings)}
      />
      <SummaryCard
        icon={<Tags className="size-4" />}
        label="Top spend"
        value={summary.topBudgetCategories[0]?.category ?? "No category"}
        detail={categoryDetail(summary.topBudgetCategories)}
      />
      <SummaryCard
        icon={<Gauge className="size-4" />}
        label="Debt pressure"
        value={formatCurrency(summary.totalDebt)}
        detail={debtDetail}
        valueClassName={summary.totalDebt > 0 ? "text-danger-700" : "text-ink-700"}
      />
      <SummaryCard
        icon={<CalendarCheck className="size-4" />}
        label="Wishlist"
        value={
          summary.activeWishlistCount > 0
            ? formatCurrency(summary.activeWishlistTotal)
            : "No active wishes"
        }
        detail={wishlistDetail}
      />
    </section>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
  valueClassName = "text-ink-900"
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0 rounded-md border border-line-faint bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
          <p className={`mt-1 truncate text-lg font-semibold tabular-nums ${valueClassName}`}>
            {value}
          </p>
        </div>
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-canvas text-ink-500">
          {icon}
        </span>
      </div>
      <p className="mt-2 text-sm leading-5 text-ink-500">{detail}</p>
    </div>
  );
}
