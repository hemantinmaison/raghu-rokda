import type { ReactNode } from "react";

export type TableHeader = {
  label: string;
  icon: ReactNode;
  align?: "left" | "right";
  width?: string;
};

export type CreateAction = (formData: FormData) => Promise<void>;

export type SectionConfigContext = {
  budgetCategories: string[];
};
