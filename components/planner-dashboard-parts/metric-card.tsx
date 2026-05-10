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
  const color = tone === "good" ? "text-teal-700" : tone === "danger" ? "text-[#b42318]" : "";

  return (
    <div className="rounded-lg border border-[#dde2dc] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-[#626a73]">
        {icon}
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
