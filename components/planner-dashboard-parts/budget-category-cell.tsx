"use client";

import { useEffect, useState, useTransition } from "react";
import { updateBudgetItemCategory } from "@/app/actions/planner";
import { CategoryCombobox } from "./category-combobox";
import type { DashboardCategory } from "@/lib/types";

export function BudgetCategoryCell({
  itemId,
  value,
  options,
  onManageCategories
}: {
  itemId: string;
  value: string;
  options: DashboardCategory[];
  onManageCategories: () => void;
}) {
  const [category, setCategory] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isPending) setCategory(value);
  }, [isPending, value]);

  function handleValueChange(nextCategory: string) {
    if (nextCategory === category) return;
    const previousCategory = category;
    setCategory(nextCategory);
    setError(null);

    startTransition(() => {
      void updateBudgetItemCategory(itemId, nextCategory).catch((updateError) => {
        setCategory(previousCategory);
        setError(updateError instanceof Error ? updateError.message : "Could not update category.");
      });
    });
  }

  return (
    <div className="min-w-0">
      <CategoryCombobox
        name={`category-${itemId}`}
        options={options}
        value={category}
        disabled={isPending}
        variant="compact"
        required
        onValueChange={handleValueChange}
        onManageCategories={onManageCategories}
      />
      {error ? <p className="mt-1 text-xs text-danger-700">{error}</p> : null}
    </div>
  );
}
