import type { ReactNode } from "react";
import {
  CalendarCheck,
  CaseSensitive,
  ChevronDown,
  CircleDot,
  FileText,
  Hash,
  IndianRupee,
  Power,
  Repeat
} from "lucide-react";
import {
  createBudgetItem,
  createDebtItem,
  createWishlistItem,
  updateBudgetItem,
  updateDebtItem,
  updateWishlistItem
} from "@/app/actions/planner";
import { formatCurrency, formatMonthYear } from "@/lib/finance";
import type {
  DashboardBudgetItem,
  DashboardDebtItem,
  DashboardWishlistItem,
  ForecastEntry,
  PlannerKind
} from "@/lib/types";
import { ForecastCell, PlaceholderCell } from "./table-cells";
import {
  EditableNameCell,
  EditableNumberCell,
  EditableTextCell,
  EditableToggleCell
} from "./editable-cells";
import { NewNameInput, NewNumberInput, NewTextInput } from "./new-item-inputs";
import { CategoryCombobox } from "./category-combobox";
import { BudgetCategoryCell } from "./budget-category-cell";
import { DebtPayoffCalculator } from "./debt-payoff-calculator";
import type { CreateAction, SectionConfigContext, TableHeader } from "./types";

type SectionItem = DashboardBudgetItem | DashboardDebtItem | DashboardWishlistItem;

export type SectionConfig<T extends SectionItem> = {
  kind: PlannerKind;
  title: string;
  headers: TableHeader[];
  createAction: CreateAction;
  renderNewCells: (formId: string, ctx: SectionConfigContext) => ReactNode[];
  renderCells: (item: T, ctx: { forecast?: ForecastEntry } & SectionConfigContext) => ReactNode[];
  renderDetail?: (item: T, ctx: SectionConfigContext) => ReactNode;
};

const BUDGET_HEADERS: TableHeader[] = [
  { label: "Name", icon: <CaseSensitive className="size-4" />, width: "30%" },
  { label: "Type", icon: <ChevronDown className="size-4" />, width: "18%" },
  { label: "Amount", icon: <IndianRupee className="size-4" />, align: "right", width: "14%" },
  { label: "Details", icon: <FileText className="size-4" />, width: "28%" }
];

const DEBT_HEADERS: TableHeader[] = [
  { label: "Name", icon: <CaseSensitive className="size-4" />, width: "17%" },
  { label: "Amount", icon: <IndianRupee className="size-4" />, align: "right", width: "12%" },
  { label: "Monthly EMI", icon: <Repeat className="size-4" />, align: "right", width: "13%" },
  { label: "Interest", icon: <CircleDot className="size-4" />, width: "10%" },
  { label: "Tenure", icon: <Hash className="size-4" />, width: "11%" },
  { label: "Forecast", icon: <CalendarCheck className="size-4" />, width: "17%" },
  { label: "Details", icon: <FileText className="size-4" />, width: "20%" }
];

const WISHLIST_HEADERS: TableHeader[] = [
  { label: "Name", icon: <CaseSensitive className="size-4" />, width: "26%" },
  { label: "Amount", icon: <IndianRupee className="size-4" />, align: "right", width: "15%" },
  { label: "Forecast", icon: <CalendarCheck className="size-4" />, width: "21%" },
  { label: "Details", icon: <FileText className="size-4" />, width: "24%" },
  { label: "Active", icon: <Power className="size-4" />, width: "14%" }
];

export const budgetConfig: SectionConfig<DashboardBudgetItem> = {
  kind: "budget",
  title: "Monthly Budget",
  headers: BUDGET_HEADERS,
  createAction: createBudgetItem,
  renderNewCells: (formId, { budgetCategories }) => [
    <NewNameInput key="name" formId={formId} placeholder="Budget name" />,
    <CategoryCombobox key="category" formId={formId} name="category" options={budgetCategories} required />,
    <NewNumberInput key="amount" formId={formId} name="amount" placeholder="0" required align="right" />,
    <NewTextInput key="details" formId={formId} name="details" placeholder="Optional details" />
  ],
  renderCells: (item, { budgetCategories }) => [
    <EditableNameCell
      key="name"
      name={item.name}
      emoji={item.emoji}
      onSave={(patch) => updateBudgetItem(item.id, patch)}
    />,
    <BudgetCategoryCell
      key="category"
      itemId={item.id}
      value={item.category}
      options={budgetCategories}
    />,
    <EditableNumberCell
      key="amount"
      value={item.amount}
      required
      align="right"
      format={formatCurrency}
      onSave={(amount) => updateBudgetItem(item.id, { amount: amount ?? undefined })}
    />,
    <EditableTextCell
      key="details"
      value={item.details}
      onSave={(details) => updateBudgetItem(item.id, { details })}
    />
  ]
};

export const debtConfig: SectionConfig<DashboardDebtItem> = {
  kind: "debt",
  title: "Debt Management",
  headers: DEBT_HEADERS,
  createAction: createDebtItem,
  renderNewCells: (formId) => [
    <NewNameInput key="name" formId={formId} placeholder="Debt name" />,
    <NewNumberInput key="amount" formId={formId} name="amount" placeholder="0" required align="right" />,
    <NewNumberInput
      key="emi"
      formId={formId}
      name="monthly_emi"
      placeholder="EMI"
      align="right"
    />,
    <NewNumberInput
      key="interest"
      formId={formId}
      name="interest_rate"
      placeholder="Optional"
      step="0.01"
    />,
    <NewNumberInput key="tenure" formId={formId} name="tenure_months" placeholder="Optional" />,
    <PlaceholderCell key="forecast">Calculated after save</PlaceholderCell>,
    <NewTextInput key="details" formId={formId} name="details" placeholder="Optional details" />
  ],
  renderCells: (item, { forecast }) => [
    <EditableNameCell
      key="name"
      name={item.name}
      emoji={item.emoji}
      onSave={(patch) => updateDebtItem(item.id, patch)}
    />,
    <EditableNumberCell
      key="amount"
      value={item.amount}
      required
      align="right"
      format={formatCurrency}
      onSave={(amount) => updateDebtItem(item.id, { amount: amount ?? undefined })}
    />,
    <EditableNumberCell
      key="emi"
      value={item.monthly_emi}
      align="right"
      format={formatCurrency}
      placeholder="Set EMI"
      onSave={(monthly_emi) => updateDebtItem(item.id, { monthly_emi })}
    />,
    <EditableNumberCell
      key="interest"
      value={item.interest_rate}
      step="0.01"
      format={(value) => `${value}%`}
      onSave={(interest_rate) => updateDebtItem(item.id, { interest_rate })}
    />,
    <EditableNumberCell
      key="tenure"
      value={item.tenure_months}
      format={(value) => `${value} ${value === 1 ? "month" : "months"}`}
      onSave={(tenure_months) => updateDebtItem(item.id, { tenure_months })}
    />,
    <ForecastCell
      key="forecast"
      value={forecast?.targetDate ? `Paid by ${formatMonthYear(forecast.targetDate)}` : null}
    />,
    <EditableTextCell
      key="details"
      value={item.details}
      onSave={(details) => updateDebtItem(item.id, { details })}
    />
  ],
  renderDetail: (item, ctx) => (
    <DebtPayoffCalculator debt={item} monthlySavings={ctx.monthlySavings} />
  )
};

export const wishlistConfig: SectionConfig<DashboardWishlistItem> = {
  kind: "wishlist",
  title: "Wishlist",
  headers: WISHLIST_HEADERS,
  createAction: createWishlistItem,
  renderNewCells: (formId) => [
    <NewNameInput key="name" formId={formId} placeholder="Wishlist item" />,
    <NewNumberInput key="amount" formId={formId} name="amount" placeholder="0" required align="right" />,
    <PlaceholderCell key="forecast">Calculated after save</PlaceholderCell>,
    <NewTextInput key="details" formId={formId} name="details" placeholder="Optional details" />,
    <PlaceholderCell key="active">On after save</PlaceholderCell>
  ],
  renderCells: (item, { forecast }) => [
    <EditableNameCell
      key="name"
      name={item.name}
      emoji={item.emoji}
      onSave={(patch) => updateWishlistItem(item.id, patch)}
    />,
    <EditableNumberCell
      key="amount"
      value={item.amount}
      required
      align="right"
      format={formatCurrency}
      onSave={(amount) => updateWishlistItem(item.id, { amount: amount ?? undefined })}
    />,
    item.is_active ? (
      <ForecastCell
        key="forecast"
        value={
          forecast?.targetDate ? `Available by ${formatMonthYear(forecast.targetDate)}` : null
        }
      />
    ) : (
      <span
        key="forecast"
        className="inline-flex rounded px-2 py-0.5 text-[13px]"
        style={{ backgroundColor: "#e3e2e0", color: "#6b6862" }}
      >
        Paused
      </span>
    ),
    <EditableTextCell
      key="details"
      value={item.details}
      onSave={(details) => updateWishlistItem(item.id, { details })}
    />,
    <EditableToggleCell
      key="active"
      value={item.is_active}
      onSave={(is_active) => updateWishlistItem(item.id, { is_active })}
    />
  ]
};
