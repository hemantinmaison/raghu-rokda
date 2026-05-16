"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Quote as QuoteIcon } from "lucide-react";
import { toggleQuoteLike } from "@/app/actions/quotes";
import { QUOTES, QUOTE_THEMES, themeMeta, type QuoteTheme } from "@/lib/quotes";

type Filter = QuoteTheme | "all" | "liked";

type QuotesViewProps = {
  isAuthenticated: boolean;
  likeCounts: Record<string, number>;
  likedIds: string[];
};

export function QuotesView({ isAuthenticated, likeCounts, likedIds }: QuotesViewProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [liked, setLiked] = useState<Set<string>>(() => new Set(likedIds));
  const [counts, setCounts] = useState<Record<string, number>>(() => ({ ...likeCounts }));
  const [, startTransition] = useTransition();

  const visible = useMemo(() => {
    if (filter === "all") return QUOTES;
    if (filter === "liked") return QUOTES.filter((quote) => liked.has(quote.id));
    return QUOTES.filter((quote) => quote.theme === filter);
  }, [filter, liked]);

  function handleLike(id: string) {
    if (!isAuthenticated) {
      router.push("/login?next=/quotes");
      return;
    }
    const wasLiked = liked.has(id);

    setLiked((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(id);
      else next.add(id);
      return next;
    });
    setCounts((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + (wasLiked ? -1 : 1))
    }));

    startTransition(() => {
      void toggleQuoteLike(id, !wasLiked).catch(() => {
        setLiked((prev) => {
          const next = new Set(prev);
          if (wasLiked) next.add(id);
          else next.delete(id);
          return next;
        });
        setCounts((prev) => ({
          ...prev,
          [id]: Math.max(0, (prev[id] ?? 0) + (wasLiked ? 1 : -1))
        }));
      });
    });
  }

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
        {isAuthenticated ? (
          <FilterChip
            label="Liked"
            count={liked.size}
            active={filter === "liked"}
            onClick={() => setFilter("liked")}
          />
        ) : null}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-line-faint bg-white p-8 text-center text-sm text-ink-400">
          {filter === "liked"
            ? "You haven't liked any quotes yet. Tap the heart on a quote to save it here."
            : "No quotes in this category yet."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((quote) => {
            const meta = themeMeta(quote.theme);
            const isLiked = liked.has(quote.id);
            return (
              <article
                key={quote.id}
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
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleLike(quote.id)}
                      aria-pressed={isLiked}
                      aria-label={isLiked ? "Unlike quote" : "Like quote"}
                      className="focus-ring inline-flex items-center gap-1 rounded px-1.5 py-1 text-sm hover:bg-canvas"
                    >
                      <Heart
                        className={`size-4 ${isLiked ? "text-rose-600" : "text-ink-300"}`}
                        fill={isLiked ? "currentColor" : "none"}
                        aria-hidden
                      />
                      <span className="tabular-nums text-ink-500">{counts[quote.id] ?? 0}</span>
                    </button>
                    <span
                      className="rounded px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: meta.bg, color: meta.text }}
                    >
                      {meta.label}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
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
