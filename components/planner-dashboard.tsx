"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { reorderItems } from "@/app/actions/planner";
import { ChatWidget } from "@/components/chat-widget";
import { DashboardSummary } from "@/components/planner-dashboard-parts/dashboard-summary";
import { PlannerSection } from "@/components/planner-dashboard-parts/planner-section";
import {
  budgetConfig,
  debtConfig,
  wishlistConfig
} from "@/components/planner-dashboard-parts/section-configs";
import { buildForecast, buildPlannerSummary, formatCurrency } from "@/lib/finance";
import type {
  DashboardBudgetItem,
  DashboardDebtItem,
  DashboardProfile,
  DashboardWishlistItem,
  PlannerKind
} from "@/lib/types";

type DashboardProps = {
  profile: DashboardProfile;
  budgetItems: DashboardBudgetItem[];
  debtItems: DashboardDebtItem[];
  wishlistItems: DashboardWishlistItem[];
  budgetCategories: string[];
};

const TABS = [
  { kind: "budget" as const, label: "Monthly Budget" },
  { kind: "debt" as const, label: "Debt Management" },
  { kind: "wishlist" as const, label: "Wishlist" }
];

function reorderReducer<T>(_prev: T[], next: T[]): T[] {
  return next;
}

function savingsTone(value: number) {
  if (value < 0) return "text-danger-700";
  if (value > 0) return "text-brand-700";
  return "text-ink-700";
}

/** Compact figure shown top-right of section titles. */
function HeaderMetricBadge({
  label,
  value,
  tone = savingsTone(value)
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="shrink-0 text-right">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
        {label}
      </p>
      <p className={`text-sm font-semibold tabular-nums ${tone}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

/** Savings summary shown below the Monthly Budget table. */
function SavingsFooter({
  salary,
  budgetTotal,
  value
}: {
  salary: number;
  budgetTotal: number;
  value: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line-faint bg-canvas px-4 py-3">
      <span className="text-sm text-ink-500">
        Monthly savings · {formatCurrency(salary)} salary − {formatCurrency(budgetTotal)} budget
      </span>
      <span className={`text-base font-semibold tabular-nums ${savingsTone(value)}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export function PlannerDashboard({
  profile,
  budgetItems,
  debtItems,
  wishlistItems,
  budgetCategories
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<PlannerKind>("budget");
  const [, startTransition] = useTransition();

  const [budgetView, setBudgetOrder] = useOptimistic(
    budgetItems,
    reorderReducer<DashboardBudgetItem>
  );
  const [debtView, setDebtOrder] = useOptimistic(
    debtItems,
    reorderReducer<DashboardDebtItem>
  );
  const [wishlistView, setWishlistOrder] = useOptimistic(
    wishlistItems,
    reorderReducer<DashboardWishlistItem>
  );

  const forecast = useMemo(
    () =>
      buildForecast({
        monthlySalary: profile.monthly_salary,
        budgetItems: budgetView,
        debtItems: debtView,
        wishlistItems: wishlistView
      }),
    [budgetView, debtView, profile.monthly_salary, wishlistView]
  );

  const summary = useMemo(
    () =>
      buildPlannerSummary({
        monthlySalary: profile.monthly_salary,
        budgetItems: budgetView,
        debtItems: debtView,
        wishlistItems: wishlistView,
        forecast
      }),
    [budgetView, debtView, forecast, profile.monthly_salary, wishlistView]
  );

  const sectionContext = useMemo(
    () => ({ budgetCategories, monthlySavings: forecast.monthlySavings }),
    [budgetCategories, forecast.monthlySavings]
  );

  function commitReorder<T extends { id: string }>(
    kind: PlannerKind,
    apply: (items: T[]) => void,
    nextItems: T[]
  ) {
    startTransition(() => {
      apply(nextItems);
      reorderItems(
        kind,
        nextItems.map((item) => item.id)
      );
    });
  }

  const tabCounts: Record<PlannerKind, number> = {
    budget: budgetView.length,
    debt: debtView.length,
    wishlist: wishlistView.length
  };
  const totalDebt = summary.totalDebt;

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-3 py-4 sm:px-5 sm:py-6">
      <DashboardSummary summary={summary} />

      <div className="grid gap-4">
        <div
          role="tablist"
          aria-label="Planner sections"
          className="-mx-3 flex gap-1 overflow-x-auto border-b border-line-faint px-3 sm:mx-0 sm:px-0"
        >
          {TABS.map(({ kind, label }) => {
            const isActive = activeTab === kind;
            return (
              <button
                key={kind}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`panel-${kind}`}
                id={`tab-${kind}`}
                onClick={() => setActiveTab(kind)}
                className={`focus-ring relative whitespace-nowrap px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "text-ink-900"
                    : "text-ink-400 hover:text-ink-700"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {label}
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs tabular-nums ${
                      isActive ? "bg-canvas text-ink-700" : "text-ink-300"
                    }`}
                  >
                    {tabCounts[kind]}
                  </span>
                </span>
                {isActive ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-ink-900"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === "budget" ? (
            <PlannerSection
              {...budgetConfig}
              items={budgetView}
              onItemsChange={(next) => commitReorder("budget", setBudgetOrder, next)}
              forecastById={null}
              sectionContext={sectionContext}
              footerNote={
                <SavingsFooter
                  salary={profile.monthly_salary}
                  budgetTotal={forecast.budgetTotal}
                  value={forecast.monthlySavings}
                />
              }
            />
          ) : activeTab === "debt" ? (
            <PlannerSection
              {...debtConfig}
              items={debtView}
              onItemsChange={(next) => commitReorder("debt", setDebtOrder, next)}
              forecastById={forecast.debtForecastById}
              sectionContext={sectionContext}
              headerRight={
                <HeaderMetricBadge label="Monthly savings" value={forecast.monthlySavings} />
              }
            />
          ) : (
            <PlannerSection
              {...wishlistConfig}
              items={wishlistView}
              onItemsChange={(next) => commitReorder("wishlist", setWishlistOrder, next)}
              forecastById={forecast.wishlistForecastById}
              sectionContext={sectionContext}
              headerRight={
                <HeaderMetricBadge
                  label="Total debt"
                  value={totalDebt}
                  tone={totalDebt > 0 ? "text-danger-700" : "text-ink-700"}
                />
              }
            />
          )}
        </div>
      </div>

      <ChatWidget activeTab={activeTab} budgetCategories={budgetCategories} />
    </div>
  );
}
