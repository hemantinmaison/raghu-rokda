"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import {
  BadgeIndianRupee,
  CalendarCheck,
  Save,
  SlidersHorizontal
} from "lucide-react";
import { reorderItems, updateSalary } from "@/app/actions/planner";
import { MetricCard } from "@/components/planner-dashboard-parts/metric-card";
import { PlannerSection } from "@/components/planner-dashboard-parts/planner-section";
import {
  budgetConfig,
  debtConfig,
  wishlistConfig
} from "@/components/planner-dashboard-parts/section-configs";
import { buildForecast, formatCurrency } from "@/lib/finance";
import type {
  DashboardBudgetItem,
  DashboardDebtItem,
  DashboardProfile,
  DashboardWishlistItem,
  PlannerKind
} from "@/lib/types";

type DashboardProps = {
  profile: DashboardProfile;
  userEmail: string;
  budgetItems: DashboardBudgetItem[];
  debtItems: DashboardDebtItem[];
  wishlistItems: DashboardWishlistItem[];
};

const TABS = [
  { kind: "budget" as const, label: "Monthly Budget" },
  { kind: "debt" as const, label: "Debt Management" },
  { kind: "wishlist" as const, label: "Wishlist" }
];

function reorderReducer<T>(_prev: T[], next: T[]): T[] {
  return next;
}

export function PlannerDashboard({
  profile,
  userEmail,
  budgetItems,
  debtItems,
  wishlistItems
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

  function applyAmountSort(kind: PlannerKind) {
    if (kind === "budget") {
      const sorted = [...budgetView].sort((a, b) => b.amount - a.amount);
      commitReorder(kind, setBudgetOrder, sorted);
    } else if (kind === "debt") {
      const sorted = [...debtView].sort((a, b) => b.amount - a.amount);
      commitReorder(kind, setDebtOrder, sorted);
    } else {
      const sorted = [...wishlistView].sort((a, b) => b.amount - a.amount);
      commitReorder(kind, setWishlistOrder, sorted);
    }
  }

  const tabCounts: Record<PlannerKind, number> = {
    budget: budgetView.length,
    debt: debtView.length,
    wishlist: wishlistView.length
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6">
      <section className="grid gap-4 rounded-lg border border-line bg-white p-4 shadow-sm lg:grid-cols-[1fr_380px] lg:items-end">
        <div>
          <p className="text-sm text-ink-500">{userEmail}</p>
          <h2 className="mt-1 text-3xl font-semibold">
            Plan this month and the months after it.
          </h2>
        </div>
        <form action={updateSalary} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="grid gap-1 text-sm font-medium">
            Monthly salary
            <input
              className="focus-ring rounded-md border border-line px-3 py-3"
              name="monthly_salary"
              type="number"
              min="0"
              step="1"
              defaultValue={profile.monthly_salary}
            />
          </label>
          <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800">
            <Save className="size-4" />
            Save
          </button>
        </form>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard
          icon={<BadgeIndianRupee className="size-5" />}
          label="Monthly budget"
          value={formatCurrency(forecast.budgetTotal)}
        />
        <MetricCard
          icon={<SlidersHorizontal className="size-5" />}
          label="Monthly savings"
          value={formatCurrency(forecast.monthlySavings)}
          tone={forecast.monthlySavings > 0 ? "good" : "danger"}
        />
        <MetricCard
          icon={<CalendarCheck className="size-5" />}
          label="Forecast status"
          value={forecast.monthlySavings > 0 ? "Projected" : "Needs surplus"}
        />
      </section>

      <div className="grid gap-4">
        <div role="tablist" aria-label="Planner sections" className="flex justify-center">
          <div className="inline-flex max-w-full overflow-x-auto rounded-md border border-line bg-white p-1 shadow-sm">
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
                  className={`focus-ring whitespace-nowrap rounded px-4 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-ink-900 text-white"
                      : "text-ink-500 hover:bg-canvas hover:text-ink-900"
                  }`}
                >
                  {label}
                  <span className={isActive ? "ml-2 text-white/70" : "ml-2 text-ink-300"}>
                    {tabCounts[kind]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === "budget" ? (
            <PlannerSection
              {...budgetConfig}
              items={budgetView}
              onItemsChange={(next) => commitReorder("budget", setBudgetOrder, next)}
              onSortAmount={() => applyAmountSort("budget")}
              forecastById={null}
            />
          ) : activeTab === "debt" ? (
            <PlannerSection
              {...debtConfig}
              items={debtView}
              onItemsChange={(next) => commitReorder("debt", setDebtOrder, next)}
              onSortAmount={() => applyAmountSort("debt")}
              forecastById={forecast.debtForecastById}
            />
          ) : (
            <PlannerSection
              {...wishlistConfig}
              items={wishlistView}
              onItemsChange={(next) => commitReorder("wishlist", setWishlistOrder, next)}
              onSortAmount={() => applyAmountSort("wishlist")}
              forecastById={forecast.wishlistForecastById}
            />
          )}
        </div>
      </div>
    </div>
  );
}
