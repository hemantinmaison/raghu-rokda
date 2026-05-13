import type { ReactNode } from "react";
import { formatCurrency } from "@/lib/finance";

export function NameCell({ title }: { title: string }) {
  return <div className="min-w-44 font-semibold text-ink-700">{title}</div>;
}

export function AmountCell({ value }: { value: number }) {
  return <div className="font-medium tabular-nums text-ink-900">{formatCurrency(value)}</div>;
}

export function PropertyCell({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded bg-brand-50 px-2 py-1 text-xs font-medium text-teal-900">
      {children}
    </span>
  );
}

export function ForecastCell({ value }: { value: string | null }) {
  if (value === null) {
    return (
      <span className="inline-flex rounded bg-[#f3f4f2] px-2 py-1 text-xs font-medium text-ink-500">
        No projection
      </span>
    );
  }
  return (
    <span className="inline-flex rounded bg-brand-50 px-2 py-1 text-xs font-medium text-teal-900">
      {value}
    </span>
  );
}

export function DetailsCell({ details }: { details: string | null }) {
  return <div className="line-clamp-2 min-w-44 text-ink-400">{details ?? "—"}</div>;
}

export function PlaceholderCell({ children }: { children: ReactNode }) {
  return <span className="flex h-14 items-center px-4 text-sm text-ink-200">{children}</span>;
}
