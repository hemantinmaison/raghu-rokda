import type { ReactNode } from "react";
import { formatCurrency } from "@/lib/finance";

export function NameCell({ title }: { title: string }) {
  return <div className="min-w-44 font-semibold text-[#2f2f2f]">{title}</div>;
}

export function AmountCell({ value }: { value: number }) {
  return <div className="font-medium tabular-nums text-[#171a1f]">{formatCurrency(value)}</div>;
}

export function PropertyCell({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded bg-[#eef4f1] px-2 py-1 text-xs font-medium text-teal-900">
      {children}
    </span>
  );
}

export function ForecastCell({ value }: { value: string }) {
  const hasProjection = value !== "No projection";

  return (
    <span
      className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
        hasProjection ? "bg-[#eef4f1] text-teal-900" : "bg-[#f3f4f2] text-[#626a73]"
      }`}
    >
      {value}
    </span>
  );
}

export function DetailsCell({ details }: { details?: string | null }) {
  return <div className="line-clamp-2 min-w-44 text-[#7d7772]">{details || "Empty"}</div>;
}

export function MutedCell({ children }: { children: ReactNode }) {
  return <span className="flex h-14 items-center px-4 text-sm text-[#9b9690]">{children}</span>;
}
