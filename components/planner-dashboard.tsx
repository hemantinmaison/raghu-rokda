"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  BadgeIndianRupee,
  CalendarCheck,
  GripVertical,
  Plus,
  Save,
  SlidersHorizontal,
  Trash2
} from "lucide-react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createBudgetItem,
  createDebtItem,
  createWishlistItem,
  deleteItem,
  reorderItems,
  updateSalary
} from "@/app/actions/planner";
import { buildForecast, formatCurrency, formatMonthYear } from "@/lib/finance";
import type { BudgetItem, DebtItem, PlannerKind, Profile, WishlistItem } from "@/lib/types";

const categories = [
  "Rent",
  "Groceries",
  "Transport",
  "Utilities",
  "Insurance",
  "Healthcare",
  "Education",
  "Subscriptions",
  "Family",
  "Other"
];

type DashboardProps = {
  profile: Profile;
  userEmail: string;
  budgetItems: BudgetItem[];
  debtItems: DebtItem[];
  wishlistItems: WishlistItem[];
};

export function PlannerDashboard({
  profile,
  userEmail,
  budgetItems,
  debtItems,
  wishlistItems
}: DashboardProps) {
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

      <div className="grid gap-6 xl:grid-cols-3">
        <PlannerSection
          kind="budget"
          title="Monthly Budget"
          items={budgetOrder}
          onItemsChange={setBudgetOrder}
          onSortAmount={() => applyAmountSort("budget")}
          renderForm={<BudgetForm />}
          renderItem={(item) => (
            <ItemBody
              title={item.name}
              meta={`${item.category} · ${formatCurrency(item.amount)}`}
              details={item.details}
            />
          )}
        />

        <PlannerSection
          kind="debt"
          title="Debt Management"
          items={debtOrder}
          onItemsChange={setDebtOrder}
          onSortAmount={() => applyAmountSort("debt")}
          renderForm={<DebtForm />}
          renderItem={(item) => {
            const forecastItem = debtForecastById.get(item.id);
            return (
              <ItemBody
                title={item.name}
                meta={formatCurrency(item.amount)}
                details={item.details}
                chips={[
                  item.interest_rate === null ? null : `${item.interest_rate}% interest`,
                  item.tenure_months === null ? null : `${item.tenure_months} months`,
                  forecastItem?.targetDate ? `Paid by ${formatMonthYear(forecastItem.targetDate)}` : "No projection"
                ]}
              />
            );
          }}
        />

        <PlannerSection
          kind="wishlist"
          title="Wishlist"
          items={wishlistOrder}
          onItemsChange={setWishlistOrder}
          onSortAmount={() => applyAmountSort("wishlist")}
          renderForm={<WishlistForm />}
          renderItem={(item) => {
            const forecastItem = wishlistForecastById.get(item.id);
            return (
              <ItemBody
                title={item.name}
                meta={formatCurrency(item.amount)}
                details={item.details}
                chips={[
                  forecastItem?.targetDate
                    ? `Available by ${formatMonthYear(forecastItem.targetDate)}`
                    : "No projection"
                ]}
              />
            );
          }}
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone = "default"
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "good" | "danger";
}) {
  const color = tone === "good" ? "text-teal-700" : tone === "danger" ? "text-[#b42318]" : "";
  return (
    <div className="rounded-lg border border-[#dde2dc] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-[#626a73]">
        {icon}
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function PlannerSection<T extends { id: string; amount: number }>({
  kind,
  title,
  items,
  onItemsChange,
  onSortAmount,
  renderForm,
  renderItem
}: {
  kind: PlannerKind;
  title: string;
  items: T[];
  onItemsChange: (items: T[]) => void;
  onSortAmount: () => void;
  renderForm: React.ReactNode;
  renderItem: (item: T) => React.ReactNode;
}) {
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const orderedItems = arrayMove(items, oldIndex, newIndex);
    onItemsChange(orderedItems);
    startTransition(() => reorderItems(kind, orderedItems.map((item) => item.id)));
  }

  return (
    <section className="rounded-lg border border-[#dde2dc] bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-[#626a73]">{items.length} item{items.length === 1 ? "" : "s"}</p>
        </div>
        <button
          type="button"
          onClick={onSortAmount}
          className="focus-ring inline-flex items-center gap-2 rounded-md border border-[#dde2dc] px-3 py-2 text-sm font-semibold hover:bg-[#f7f8f3]"
        >
          <SlidersHorizontal className="size-4" />
          Amount
        </button>
      </div>

      {renderForm}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="mt-4 grid gap-3">
            {items.map((item) => (
              <SortableItem key={item.id} id={item.id} kind={kind}>
                {renderItem(item)}
              </SortableItem>
            ))}
            {!items.length ? (
              <div className="rounded-md border border-dashed border-[#dde2dc] p-4 text-sm text-[#626a73]">
                Add your first item to start the projection.
              </div>
            ) : null}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}

function SortableItem({
  id,
  kind,
  children
}: {
  id: string;
  kind: PlannerKind;
  children: React.ReactNode;
}) {
  const [, startTransition] = useTransition();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-md border border-[#dde2dc] bg-white p-3 ${isDragging ? "shadow-lg" : ""}`}
    >
      <div className="grid grid-cols-[auto_1fr_auto] gap-3">
        <button
          type="button"
          className="focus-ring mt-1 rounded-md p-1 text-[#626a73] hover:bg-[#f7f8f3]"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
        {children}
        <button
          type="button"
          onClick={() => startTransition(() => deleteItem(kind, id))}
          className="focus-ring mt-1 rounded-md p-1 text-[#b42318] hover:bg-red-50"
          aria-label="Delete item"
        >
          <Trash2 className="size-5" />
        </button>
      </div>
    </div>
  );
}

function ItemBody({
  title,
  meta,
  details,
  chips = []
}: {
  title: string;
  meta: string;
  details?: string | null;
  chips?: Array<string | null>;
}) {
  return (
    <div className="min-w-0">
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-sm text-[#626a73]">{meta}</div>
      {details ? <p className="mt-2 text-sm leading-6 text-[#424951]">{details}</p> : null}
      {chips.filter(Boolean).length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.filter(Boolean).map((chip) => (
            <span key={chip} className="rounded-md bg-[#eef4f1] px-2 py-1 text-xs font-medium text-teal-900">
              {chip}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BudgetForm() {
  return (
    <form action={createBudgetItem} className="grid gap-2 rounded-md bg-[#f7f8f3] p-3">
      <input className="focus-ring rounded-md border border-[#dde2dc] px-3 py-2" name="name" placeholder="Name" required />
      <input className="focus-ring rounded-md border border-[#dde2dc] px-3 py-2" name="amount" type="number" min="1" step="1" placeholder="Amount" required />
      <input className="focus-ring rounded-md border border-[#dde2dc] px-3 py-2" name="category" list="budget-categories" placeholder="Type / category" required />
      <datalist id="budget-categories">
        {categories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
      <textarea className="focus-ring min-h-20 rounded-md border border-[#dde2dc] px-3 py-2" name="details" placeholder="Details" />
      <SubmitButton label="Add budget" />
    </form>
  );
}

function DebtForm() {
  return (
    <form action={createDebtItem} className="grid gap-2 rounded-md bg-[#f7f8f3] p-3">
      <input className="focus-ring rounded-md border border-[#dde2dc] px-3 py-2" name="name" placeholder="Name" required />
      <input className="focus-ring rounded-md border border-[#dde2dc] px-3 py-2" name="amount" type="number" min="1" step="1" placeholder="Amount" required />
      <div className="grid gap-2 sm:grid-cols-2">
        <input className="focus-ring rounded-md border border-[#dde2dc] px-3 py-2" name="interest_rate" type="number" min="0" step="0.01" placeholder="Interest optional" />
        <input className="focus-ring rounded-md border border-[#dde2dc] px-3 py-2" name="tenure_months" type="number" min="1" step="1" placeholder="Tenure optional" />
      </div>
      <textarea className="focus-ring min-h-20 rounded-md border border-[#dde2dc] px-3 py-2" name="details" placeholder="Details" />
      <SubmitButton label="Add debt" />
    </form>
  );
}

function WishlistForm() {
  return (
    <form action={createWishlistItem} className="grid gap-2 rounded-md bg-[#f7f8f3] p-3">
      <input className="focus-ring rounded-md border border-[#dde2dc] px-3 py-2" name="name" placeholder="Name" required />
      <input className="focus-ring rounded-md border border-[#dde2dc] px-3 py-2" name="amount" type="number" min="1" step="1" placeholder="Amount" required />
      <textarea className="focus-ring min-h-20 rounded-md border border-[#dde2dc] px-3 py-2" name="details" placeholder="Details" />
      <SubmitButton label="Add wishlist" />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-[#171a1f] px-3 py-2 font-semibold text-white hover:bg-[#2b3037]">
      <Plus className="size-4" />
      {label}
    </button>
  );
}
