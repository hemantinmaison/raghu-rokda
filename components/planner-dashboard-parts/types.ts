import type { ReactNode } from "react";
import type { DashboardCategory } from "@/lib/types";

export type TableHeader = {
  label: string;
  icon: ReactNode;
  align?: "left" | "right";
  width?: string;
};

export type CreateAction = (formData: FormData) => Promise<void>;

export type SectionConfigContext = {
  categories: DashboardCategory[];
  onManageCategories: () => void;
  /** Current monthly savings (salary − budget) — used to prefill calculators. */
  monthlySavings: number;
};
