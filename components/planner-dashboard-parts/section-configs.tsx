import type { ReactNode } from "react";
import {
  CalendarCheck,
  CaseSensitive,
  ChevronDown,
  CircleDot,
  FileText,
  Hash,
  IndianRupee
} from "lucide-react";
import {
  createBudgetItem,
  createDebtItem,
  createWishlistItem
} from "@/app/actions/planner";
import { formatMonthYear } from "@/lib/finance";
import type {
  DashboardBudgetItem,
  DashboardDebtItem,
  DashboardWishlistItem,
  ForecastEntry,
  PlannerKind
} from "@/lib/types";
import {
  AmountCell,
  DetailsCell,
  ForecastCell,
  NameCell,
  PlaceholderCell,
  PropertyCell
} from "./table-cells";
import { CategoryTag } from "./category-tag";
import { NewNameInput, NewNumberInput, NewTextInput } from "./new-item-inputs";
import { CategoryCombobox } from "./category-combobox";
import type { CreateAction, SectionConfigContext, TableHeader } from "./types";

type SectionItem = DashboardBudgetItem | DashboardDebtItem | DashboardWishlistItem;

export type SectionConfig<T extends SectionItem> = {
  kind: PlannerKind;
  title: string;
  headers: TableHeader[];
  createAction: CreateAction;
  renderNewCells: (formId: string, ctx: SectionConfigContext) => ReactNode[];
  renderCells: (item: T, ctx: { forecast?: ForecastEntry }) => ReactNode[];
};

const BUDGET_HEADERS: TableHeader[] = [
  { label: "Name", icon: <CaseSensitive className="size-4" /> },
  { label: "Type", icon: <ChevronDown className="size-4" /> },
  { label: "Amount", icon: <IndianRupee className="size-4" />, align: "right" },
  { label: "Details", icon: <FileText className="size-4" /> }
];

const DEBT_HEADERS: TableHeader[] = [
  { label: "Name", icon: <CaseSensitive className="size-4" /> },
  { label: "Amount", icon: <IndianRupee className="size-4" />, align: "right" },
  { label: "Interest", icon: <CircleDot className="size-4" /> },
  { label: "Tenure", icon: <Hash className="size-4" /> },
  { label: "Forecast", icon: <CalendarCheck className="size-4" /> },
  { label: "Details", icon: <FileText className="size-4" /> }
];

const WISHLIST_HEADERS: TableHeader[] = [
  { label: "Name", icon: <CaseSensitive className="size-4" /> },
  { label: "Amount", icon: <IndianRupee className="size-4" />, align: "right" },
  { label: "Forecast", icon: <CalendarCheck className="size-4" /> },
  { label: "Details", icon: <FileText className="size-4" /> }
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
  renderCells: (item) => [
    <NameCell key="name" title={item.name} emoji={item.emoji} />,
    <CategoryTag key="category" value={item.category} />,
    <AmountCell key="amount" value={item.amount} />,
    <DetailsCell key="details" details={item.details} />
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
    <NameCell key="name" title={item.name} emoji={item.emoji} />,
    <AmountCell key="amount" value={item.amount} />,
    <PropertyCell key="interest">
      {item.interest_rate === null ? "—" : `${item.interest_rate}%`}
    </PropertyCell>,
    <PropertyCell key="tenure">
      {item.tenure_months === null ? "—" : `${item.tenure_months} months`}
    </PropertyCell>,
    <ForecastCell
      key="forecast"
      value={forecast?.targetDate ? `Paid by ${formatMonthYear(forecast.targetDate)}` : null}
    />,
    <DetailsCell key="details" details={item.details} />
  ]
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
    <NewTextInput key="details" formId={formId} name="details" placeholder="Optional details" />
  ],
  renderCells: (item, { forecast }) => [
    <NameCell key="name" title={item.name} emoji={item.emoji} />,
    <AmountCell key="amount" value={item.amount} />,
    <ForecastCell
      key="forecast"
      value={
        forecast?.targetDate ? `Available by ${formatMonthYear(forecast.targetDate)}` : null
      }
    />,
    <DetailsCell key="details" details={item.details} />
  ]
};
