import type { ReactNode } from "react";

export function MetricCard({
  icon,
  label,
  value,
  tone = "default"
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "default" | "good" | "danger";
}) {
  const color = tone === "good" ? "text-teal-700" : tone === "danger" ? "text-danger-700" : "";

  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-ink-500">
        {icon}
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
