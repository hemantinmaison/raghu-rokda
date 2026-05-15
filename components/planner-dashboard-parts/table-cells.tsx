import type { ReactNode } from "react";

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

export function PlaceholderCell({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-11 min-w-0 items-center truncate px-3 text-sm text-ink-200">
      {children}
    </span>
  );
}
