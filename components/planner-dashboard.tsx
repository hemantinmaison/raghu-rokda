"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  BadgeIndianRupee,
  CalendarCheck,
  CircleDot,
  FileText,
  Hash,
  IndianRupee,
  Save,
  SlidersHorizontal,
  Tag,
  Type
} from "lucide-react";
import {
  createBudgetItem,
  createDebtItem,
  createWishlistItem,
  reorderItems,
  updateSalary
} from "@/app/actions/planner";
import { MetricCard } from "@/components/planner-dashboard-parts/metric-card";
import { NewCategoryInput, NewNumberInput, NewTextInput } from "@/components/planner-dashboard-parts/new-item-inputs";
import { PlannerSection } from "@/components/planner-dashboard-parts/planner-section";
import {
  AmountCell,
  DetailsCell,
  ForecastCell,
  MutedCell,
  NameCell,
  PropertyCell
} from "@/components/planner-dashboard-parts/table-cells";
import { buildForecast, formatCurrency, formatMonthYear } from "@/lib/finance";
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

export function PlannerDashboard({
  profile,
  userEmail,
  budgetItems,
  debtItems,
  wishlistItems
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<PlannerKind>("budget");
  const [budgetOrder, setBudgetOrder] = useState(budgetItems);
  const [debtOrder, setDebtOrder] = useState(debtItems);
  const [wishlistOrder, setWishlistOrder] = useState(wishlistItems);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setBudgetOrder(budgetItems);
  }, [budgetItems]);

  useEffect(() => {
    setDebtOrder(debtItems);
  }, [debtItems]);

  useEffect(() => {
    setWishlistOrder(wishlistItems);
  }, [wishlistItems]);

  const forecast = useMemo(
    () =>
      buildForecast({
        monthlySalary: Number(profile.monthly_salary),
        budgetItems: budgetOrder,
        debtItems: debtOrder,
        wishlistItems: wishlistOrder
      }),
    [budgetOrder, debtOrder, profile.monthly_salary, wishlistOrder]
  );

  const debtForecastById = new Map(forecast.debtForecasts.map((item) => [item.id, item]));
  const wishlistForecastById = new Map(forecast.wishlistForecasts.map((item) => [item.id, item]));
  const tabs = [
    { kind: "budget", label: "Monthly Budget", count: budgetOrder.length },
    { kind: "debt", label: "Debt Management", count: debtOrder.length },
    { kind: "wishlist", label: "Wishlist", count: wishlistOrder.length }
  ] satisfies Array<{ kind: PlannerKind; label: string; count: number }>;

  function applyAmountSort(kind: PlannerKind) {
    const sorter = <T extends { amount: number }>(items: T[]) =>
      [...items].sort((a, b) => b.amount - a.amount);

    if (kind === "budget") {
      const sorted = sorter(budgetOrder);
      setBudgetOrder(sorted);
      startTransition(() => reorderItems("budget", sorted.map((item) => item.id)));
    }
    if (kind === "debt") {
      const sorted = sorter(debtOrder);
      setDebtOrder(sorted);
      startTransition(() => reorderItems("debt", sorted.map((item) => item.id)));
    }
    if (kind === "wishlist") {
      const sorted = sorter(wishlistOrder);
      setWishlistOrder(sorted);
      startTransition(() => reorderItems("wishlist", sorted.map((item) => item.id)));
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6">
      <section className="grid gap-4 rounded-lg border border-[#dde2dc] bg-white p-4 shadow-sm lg:grid-cols-[1fr_380px] lg:items-end">
        <div>
          <p className="text-sm text-[#626a73]">{userEmail}</p>
          <h2 className="mt-1 text-3xl font-semibold">Plan this month and the months after it.</h2>
        </div>
        <form action={updateSalary} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="grid gap-1 text-sm font-medium">
            Monthly salary
            <input
              className="focus-ring rounded-md border border-[#dde2dc] px-3 py-3"
              name="monthly_salary"
              type="number"
              min="0"
              step="1"
              defaultValue={Number(profile.monthly_salary)}
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
        <div className="flex justify-center">
          <div className="inline-flex max-w-full overflow-x-auto rounded-md border border-[#dde2dc] bg-white p-1 shadow-sm">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.kind;
              return (
                <button
                  key={tab.kind}
                  type="button"
                  onClick={() => setActiveTab(tab.kind)}
                  className={`focus-ring whitespace-nowrap rounded px-4 py-2 text-sm font-medium ${
                    isActive ? "bg-[#171a1f] text-white" : "text-[#626a73] hover:bg-[#f7f8f3] hover:text-[#171a1f]"
                  }`}
                >
                  {tab.label}
                  <span className={isActive ? "ml-2 text-white/70" : "ml-2 text-[#8a9199]"}>{tab.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "budget" ? (
          <PlannerSection
            kind="budget"
            title="Monthly Budget"
            items={budgetOrder}
            headers={[
              { label: "Name", icon: <Type className="size-4" /> },
              { label: "Type / category", icon: <Tag className="size-4" /> },
              { label: "Amount", icon: <IndianRupee className="size-4" /> },
              { label: "Details", icon: <FileText className="size-4" /> }
            ]}
            onItemsChange={setBudgetOrder}
            onSortAmount={() => applyAmountSort("budget")}
            createAction={createBudgetItem}
            renderNewCells={(formId) => [
              <NewTextInput key="name" formId={formId} name="name" placeholder="Budget name" required />,
              <NewCategoryInput key="category" formId={formId} />,
              <NewNumberInput key="amount" formId={formId} name="amount" placeholder="0" required />,
              <NewTextInput key="details" formId={formId} name="details" placeholder="Optional details" />
            ]}
            renderCells={(item) => [
              <NameCell key="name" title={item.name} />,
              <PropertyCell key="category">{item.category}</PropertyCell>,
              <AmountCell key="amount" value={item.amount} />,
              <DetailsCell key="details" details={item.details} />
            ]}
          />
        ) : null}

        {activeTab === "debt" ? (
          <PlannerSection
            kind="debt"
            title="Debt Management"
            items={debtOrder}
            headers={[
              { label: "Name", icon: <Type className="size-4" /> },
              { label: "Amount", icon: <IndianRupee className="size-4" /> },
              { label: "Interest", icon: <CircleDot className="size-4" /> },
              { label: "Tenure", icon: <Hash className="size-4" /> },
              { label: "Forecast", icon: <CalendarCheck className="size-4" /> },
              { label: "Details", icon: <FileText className="size-4" /> }
            ]}
            onItemsChange={setDebtOrder}
            onSortAmount={() => applyAmountSort("debt")}
            createAction={createDebtItem}
            renderNewCells={(formId) => [
              <NewTextInput key="name" formId={formId} name="name" placeholder="Debt name" required />,
              <NewNumberInput key="amount" formId={formId} name="amount" placeholder="0" required />,
              <NewNumberInput key="interest" formId={formId} name="interest_rate" placeholder="Optional" step="0.01" />,
              <NewNumberInput key="tenure" formId={formId} name="tenure_months" placeholder="Optional" />,
              <MutedCell key="forecast">Calculated after save</MutedCell>,
              <NewTextInput key="details" formId={formId} name="details" placeholder="Optional details" />
            ]}
            renderCells={(item) => {
              const forecastItem = debtForecastById.get(item.id);
              return [
                <NameCell key="name" title={item.name} />,
                <AmountCell key="amount" value={item.amount} />,
                <PropertyCell key="interest">{item.interest_rate === null ? "Empty" : `${item.interest_rate}%`}</PropertyCell>,
                <PropertyCell key="tenure">{item.tenure_months === null ? "Empty" : `${item.tenure_months} months`}</PropertyCell>,
                <ForecastCell
                  key="forecast"
                  value={forecastItem?.targetDate ? `Paid by ${formatMonthYear(forecastItem.targetDate)}` : "No projection"}
                />,
                <DetailsCell key="details" details={item.details} />
              ];
            }}
          />
        ) : null}

        {activeTab === "wishlist" ? (
          <PlannerSection
            kind="wishlist"
            title="Wishlist"
            items={wishlistOrder}
            headers={[
              { label: "Name", icon: <Type className="size-4" /> },
              { label: "Amount", icon: <IndianRupee className="size-4" /> },
              { label: "Forecast", icon: <CalendarCheck className="size-4" /> },
              { label: "Details", icon: <FileText className="size-4" /> }
            ]}
            onItemsChange={setWishlistOrder}
            onSortAmount={() => applyAmountSort("wishlist")}
            createAction={createWishlistItem}
            renderNewCells={(formId) => [
              <NewTextInput key="name" formId={formId} name="name" placeholder="Wishlist item" required />,
              <NewNumberInput key="amount" formId={formId} name="amount" placeholder="0" required />,
              <MutedCell key="forecast">Calculated after save</MutedCell>,
              <NewTextInput key="details" formId={formId} name="details" placeholder="Optional details" />
            ]}
            renderCells={(item) => {
              const forecastItem = wishlistForecastById.get(item.id);
              return [
                <NameCell key="name" title={item.name} />,
                <AmountCell key="amount" value={item.amount} />,
                <ForecastCell
                  key="forecast"
                  value={
                    forecastItem?.targetDate
                      ? `Available by ${formatMonthYear(forecastItem.targetDate)}`
                      : "No projection"
                  }
                />,
                <DetailsCell key="details" details={item.details} />
              ];
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
