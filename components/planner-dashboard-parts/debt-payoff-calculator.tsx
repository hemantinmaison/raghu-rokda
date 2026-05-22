"use client";

import { useState } from "react";
import { TrendingDown } from "lucide-react";
import { formatCurrency, formatDuration, simulateLoanPayoff } from "@/lib/finance";
import type { DashboardDebtItem } from "@/lib/types";

export function DebtPayoffCalculator({
  debt,
  monthlySavings
}: {
  debt: DashboardDebtItem;
  monthlySavings: number;
}) {
  const [extra, setExtra] = useState(() => Math.max(0, Math.round(monthlySavings)));

  const rate = debt.interest_rate;
  const emi = debt.monthly_emi;

  if (rate === null || emi === null) {
    return (
      <p className="text-sm text-ink-500">
        Add an <strong>interest rate</strong> and a <strong>monthly EMI</strong> to this debt to
        see how much interest extra payments could save.
      </p>
    );
  }

  const baseline = simulateLoanPayoff(debt.amount, rate, emi);

  if (!baseline.cleared) {
    return (
      <p className="text-sm text-danger-700">
        An EMI of {formatCurrency(emi)} doesn&apos;t cover the monthly interest on{" "}
        {formatCurrency(debt.amount)} at {rate}% — the balance won&apos;t go down. Increase the EMI.
      </p>
    );
  }

  const withExtra = simulateLoanPayoff(debt.amount, rate, emi + Math.max(0, extra));
  const monthsSaved = Math.max(0, baseline.months - withExtra.months);
  const interestSaved = Math.max(0, baseline.totalInterest - withExtra.totalInterest);
  const showSavings = extra > 0;

  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-400">
        Balance {formatCurrency(debt.amount)} · {rate}% interest · EMI {formatCurrency(emi)}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Left: current EMI on top, extra-payment scenario below */}
        <div className="flex justify-between gap-4 rounded-md border border-line-faint bg-white p-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
              At your current EMI
            </p>
            <p className="mt-1 text-sm font-semibold text-ink-900">
              Cleared in {formatDuration(baseline.months)}
            </p>
            <p className="text-xs text-ink-500">
              Total interest {formatCurrency(baseline.totalInterest)}
            </p>
          </div>

          <div>
            <label className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-400">
              Extra / month
              <input
                type="number"
                min="0"
                step="500"
                value={Number.isFinite(extra) ? extra : ""}
                onChange={(event) => {
                  const raw = event.target.value.trim();
                  setExtra(raw === "" ? 0 : Math.max(0, Number(raw)));
                }}
                className="focus-ring w-24 rounded border-[0.01px] border-line m-0 p-0 text-[13px] tabular-nums text-ink-900"              />
            </label>
            <p className="mt-1 text-sm font-semibold text-ink-900">
              Cleared in {formatDuration(withExtra.months)}
            </p>
            <p className="text-xs text-ink-500">
              Total interest {formatCurrency(withExtra.totalInterest)}
            </p>
          </div>
        </div>

        {/* Right: savings summary */}
        <div
          className={`flex items-center rounded-md border p-3 ${
            showSavings ? "border-brand-200 bg-brand-50" : "border-line-faint bg-white"
          }`}
        >
          {showSavings ? (
            <div className="flex items-start gap-2">
              <TrendingDown className="mt-0.5 size-4 shrink-0 text-brand-700" />
              <p className="text-sm leading-6 text-brand-900">
                Paying {formatCurrency(extra)} extra each month clears this loan{" "}
                <strong>{formatDuration(monthsSaved)} sooner</strong> and saves{" "}
                <strong>{formatCurrency(interestSaved)}</strong> in interest.
              </p>
            </div>
          ) : (
            <p className="text-xs text-ink-400">
              Enter an extra monthly amount to see the time and interest you&apos;d save.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
