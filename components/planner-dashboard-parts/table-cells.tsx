import type { ReactNode } from "react";
import { formatCurrency } from "@/lib/finance";

export function NameCell({ title, emoji }: { title: string; emoji?: string | null }) {
  return (
    <div className="flex min-w-44 items-center gap-2 text-ink-900">
      <span aria-hidden className="inline-flex w-5 shrink-0 justify-center text-base leading-none">
        {emoji ?? ""}
      </span>
      <span className="truncate">{title}</span>
    </div>
  );
}

export function AmountCell({ value }: { value: number }) {
  return <div className="text-right tabular-nums text-ink-900">{formatCurrency(value)}</div>;
}

export function PropertyCell({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex rounded px-2 py-0.5 text-[13px]"
      style={{ backgroundColor: "#e3e2e0", color: "#32302c" }}
    >
      {children}
    </span>
  );
}

export function ForecastCell({ value }: { value: string | null }) {
  if (value === null) return <span className="text-ink-300">—</span>;
  return (
    <span
      className="inline-flex rounded px-2 py-0.5 text-[13px]"
      style={{ backgroundColor: "#dbeddb", color: "#1c3829" }}
    >
      {value}
    </span>
  );
}

export function DetailsCell({ details }: { details: string | null }) {
  if (!details) return <span aria-hidden />;
  return <div className="line-clamp-2 min-w-44 text-ink-500">{details}</div>;
}

export function PlaceholderCell({ children }: { children: ReactNode }) {
  return <span className="flex h-11 min-w-0 items-center truncate px-3 text-sm text-ink-200">{children}</span>;
}
