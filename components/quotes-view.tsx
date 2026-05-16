"use client";

import { useMemo, useState } from "react";
import { Quote as QuoteIcon } from "lucide-react";
import { QUOTES, QUOTE_THEMES, themeMeta, type QuoteTheme } from "@/lib/quotes";

type Filter = QuoteTheme | "all";

export function QuotesView() {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () => (filter === "all" ? QUOTES : QUOTES.filter((quote) => quote.theme === filter)),
    [filter]
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6">
      <div>
        <h2 className="text-2xl font-semibold">Money wisdom</h2>
        <p className="mt-1 text-sm text-ink-400">
          Quotes on clearing debt, financial freedom, how money works, and the Niti Shastras.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          label="All"
          count={QUOTES.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        {QUOTE_THEMES.map((theme) => (
          <FilterChip
            key={theme.id}
            label={theme.label}
            count={QUOTES.filter((quote) => quote.theme === theme.id).length}
            active={filter === theme.id}
            onClick={() => setFilter(theme.id)}
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((quote, index) => {
          const meta = themeMeta(quote.theme);
          return (
            <article
              key={`${quote.theme}-${index}-${quote.text.slice(0, 12)}`}
              className="flex flex-col gap-3 rounded-lg border border-line-faint bg-white p-5 shadow-sm"
            >
              <QuoteIcon className="size-5 text-ink-200" aria-hidden />
              {quote.sanskrit ? (
                <div className="flex-1 space-y-2.5">
                  <p className="whitespace-pre-line text-[15px] font-medium leading-8 text-ink-900">
                    {quote.sanskrit}
                  </p>
                  <p className="border-t border-line-faint pt-2.5 text-sm leading-6 text-ink-500">
                    {quote.text}
                  </p>
                </div>
              ) : (
                <p className="flex-1 text-[15px] leading-7 text-ink-900">{quote.text}</p>
              )}
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-700">{quote.author}</p>
                  {quote.source ? (
                    <p className="truncate text-xs text-ink-400">{quote.source}</p>
                  ) : null}
                </div>
                <span
                  className="shrink-0 rounded px-2 py-0.5 text-[11px] font-medium"
                  style={{ backgroundColor: meta.bg, color: meta.text }}
                >
                  {meta.label}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-ink-900 bg-ink-900 text-white"
          : "border-line bg-white text-ink-500 hover:bg-canvas hover:text-ink-900"
      }`}
    >
      {label}
      <span className={active ? "text-white/70" : "text-ink-300"}>{count}</span>
    </button>
  );
}
