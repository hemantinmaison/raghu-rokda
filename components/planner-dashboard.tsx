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

  const tabCounts: Record<PlannerKind, number> = {
    budget: budgetView.length,
    debt: debtView.length,
    wishlist: wishlistView.length
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6">
      <div className="grid gap-4">
        <div
          role="tablist"
          aria-label="Planner sections"
          className="flex gap-1 overflow-x-auto border-b border-line-faint"
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
            />
          ) : activeTab === "debt" ? (
            <PlannerSection
              {...debtConfig}
              items={debtView}
              onItemsChange={(next) => commitReorder("debt", setDebtOrder, next)}
              forecastById={forecast.debtForecastById}
              sectionContext={sectionContext}
            />
          ) : (
            <PlannerSection
              {...wishlistConfig}
              items={wishlistView}
              onItemsChange={(next) => commitReorder("wishlist", setWishlistOrder, next)}
              forecastById={forecast.wishlistForecastById}
              sectionContext={sectionContext}
            />
          )}
        </div>
      </div>
    </div>
  );
}
