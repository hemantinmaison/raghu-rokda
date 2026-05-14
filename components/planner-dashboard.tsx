"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import { reorderItems } from "@/app/actions/planner";
import { PlannerSection } from "@/components/planner-dashboard-parts/planner-section";
import {
  budgetConfig,
  debtConfig,
  wishlistConfig
} from "@/components/planner-dashboard-parts/section-configs";
import { buildForecast } from "@/lib/finance";
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

export function PlannerDashboard({
  profile,
  budgetItems,
  debtItems,
  wishlistItems,
  budgetCategories
}: DashboardProps) {
  const sectionContext = useMemo(() => ({ budgetCategories }), [budgetCategories]);
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
              sectionContext={sectionContext}
            />
          ) : activeTab === "debt" ? (
            <PlannerSection
              {...debtConfig}
              items={debtView}
              onItemsChange={(next) => commitReorder("debt", setDebtOrder, next)}
              onSortAmount={() => applyAmountSort("debt")}
              forecastById={forecast.debtForecastById}
              sectionContext={sectionContext}
            />
          ) : (
            <PlannerSection
              {...wishlistConfig}
              items={wishlistView}
              onItemsChange={(next) => commitReorder("wishlist", setWishlistOrder, next)}
              onSortAmount={() => applyAmountSort("wishlist")}
              forecastById={forecast.wishlistForecastById}
              sectionContext={sectionContext}
            />
          )}
        </div>
      </div>
    </div>
  );
}
