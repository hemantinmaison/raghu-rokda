import type { CSSProperties } from "react";
import Link from "next/link";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import { ArrowRight, Gift, ReceiptIndianRupee, Wallet } from "lucide-react";
import { QUOTES, themeMeta, type Quote } from "@/lib/quotes";
import { RotatingHeroWord } from "@/components/rotating-hero-word";

const display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display"
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body"
});

const palette = {
  "--paper": "#f3ecdd",
  "--paper-2": "#ece1c9",
  "--ink": "#1d1a14",
  "--green": "#1c6f4f",
  "--gold": "#b9881a"
} as CSSProperties;

const MARQUEE = [
  "Plan every rupee",
  "Clear the debt",
  "Fund the wishlist",
  "Forecast the future",
  "Borrow some wisdom"
];

const FEATURES = [
  {
    no: "01",
    name: "Monthly Budget",
    icon: Wallet,
    copy: "Every recurring rupee in one ledger — rent, groceries, the EMIs, the small leaks. See exactly what is left at month's end."
  },
  {
    no: "02",
    name: "Debt Management",
    icon: ReceiptIndianRupee,
    copy: "List each loan and instalment, then let an honest payoff forecast tell you the month you finally walk free."
  },
  {
    no: "03",
    name: "Wishlist",
    icon: Gift,
    copy: "The phone, the trip, the upgrade you keep postponing. Plan for what you actually want — guilt-free, on a real timeline."
  }
];

function pickQuotes(): Quote[] {
  const themes: Quote["theme"][] = ["niti", "from-books", "freedom"];
  return themes
    .map((theme) => QUOTES.find((quote) => quote.theme === theme))
    .filter((quote): quote is Quote => Boolean(quote));
}

export function LandingPage() {
  const featured = pickQuotes();

  return (
    <div
      style={palette}
      className={`${display.variable} ${body.variable} relative min-h-screen overflow-hidden bg-[var(--paper)] text-[var(--ink)] font-[family-name:var(--font-body)] antialiased`}
    >
      <div
        aria-hidden
        className="rr-grain pointer-events-none fixed inset-0 z-50 opacity-[0.18] mix-blend-multiply"
      />

      {/* --- Nav --- */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="focus-ring flex items-center gap-2.5 rounded">
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-lg bg-[var(--green)] text-lg font-[family-name:var(--font-display)] font-black text-[var(--paper)]"
          >
            ₹₹
          </span>
          <span className="text-[17px] font-semibold tracking-tight">Raghu Rokda</span>
        </Link>
        <nav className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/quotes"
            className="focus-ring rounded-full px-4 py-2 text-sm font-medium text-[var(--ink)]/70 transition-colors hover:text-[var(--ink)]"
          >
            Quotes
          </Link>
          <Link
            href="/login"
            className="focus-ring rounded-full bg-[var(--ink)] px-5 py-2 text-sm font-semibold text-[var(--paper)] transition-transform hover:-translate-y-0.5"
          >
            Sign in
          </Link>
        </nav>
      </header>

      {/* --- Hero --- */}
      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-10 sm:pb-24 sm:pt-16">
        <span
          aria-hidden
          className="rr-float pointer-events-none absolute -right-10 top-0 select-none font-[family-name:var(--font-display)] text-[22rem] font-black leading-none text-[var(--green)]/[0.07] sm:-right-4 sm:text-[30rem]"
        >
          ₹₹
        </span>

        <p
          className="rr-rise flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--green)]"
          style={{ animationDelay: "0.05s" }}
        >
          <span className="h-px w-10 bg-[var(--green)]" />
          A planner for your paisa
        </p>

        <h1
          className="rr-rise mt-7 max-w-[16ch] font-[family-name:var(--font-display)] text-[clamp(2.9rem,8.5vw,6.5rem)] font-black leading-[0.95] tracking-[-0.02em]"
          style={{ animationDelay: "0.13s" }}
        >
          Take command of your{" "}
          <RotatingHeroWord />
        </h1>

        <div
          className="rr-rise mt-8 flex max-w-xl flex-col gap-7"
          style={{ animationDelay: "0.22s" }}
        >
          <p className="text-lg leading-relaxed text-[var(--ink)]/75 sm:text-xl">
            A calm, private planner for your monthly budget, debt payoff, and the goals you are
            quietly saving toward. No spreadsheets. No noise. Just a clear picture.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="focus-ring group inline-flex items-center gap-2 rounded-full bg-[var(--green)] px-7 py-3.5 text-[15px] font-semibold text-[var(--paper)] shadow-[0_12px_28px_-12px_rgba(28,111,79,0.7)] transition-transform hover:-translate-y-0.5"
            >
              Start planning — it&apos;s free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/quotes"
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-[var(--ink)]/20 px-7 py-3.5 text-[15px] font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--paper-2)]"
            >
              Browse money wisdom
            </Link>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--ink)]/55">
            {["Free forever", "Private by default", "Built for rupees"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[var(--gold)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Marquee strip --- */}
      <div className="relative z-10 overflow-hidden border-y border-[var(--ink)]/15 bg-[var(--ink)] py-4">
        <div className="rr-marquee flex w-max">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {MARQUEE.map((word) => (
                <span key={word} className="flex items-center">
                  <span className="px-7 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--paper)]">
                    {word}
                  </span>
                  <span className="text-lg text-[var(--gold)]">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* --- Features --- */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-[14ch] font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.4rem)] font-black leading-[1.02] tracking-[-0.02em]">
            Three ledgers, one clear head.
          </h2>
          <p className="max-w-xs text-[var(--ink)]/65">
            Everything Raghu Rokda does, it does without clutter — three honest views of your
            money.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.no}
                className="group flex flex-col rounded-2xl border border-[var(--ink)]/12 bg-[var(--paper-2)]/60 p-7 transition-all hover:-translate-y-1.5 hover:border-[var(--green)]/40 hover:bg-[var(--paper-2)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-display)] text-5xl font-black text-[var(--ink)]/15 transition-colors group-hover:text-[var(--green)]/30">
                    {feature.no}
                  </span>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--green)] text-[var(--paper)]">
                    <Icon className="size-5" />
                  </span>
                </div>
                <h3 className="mt-8 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
                  {feature.name}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink)]/70">
                  {feature.copy}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* --- Quotes teaser --- */}
      <section className="relative z-10 border-t border-[var(--ink)]/12 bg-[var(--paper-2)]/50">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--green)]">
                <span className="h-px w-10 bg-[var(--green)]" />
                Wisdom worth borrowing
              </p>
              <h2 className="mt-5 max-w-[16ch] font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.4rem)] font-black leading-[1.02] tracking-[-0.02em]">
                Money has been studied for millennia.
              </h2>
            </div>
            <Link
              href="/quotes"
              className="focus-ring group inline-flex shrink-0 items-center gap-2 text-[15px] font-semibold text-[var(--green)]"
            >
              Read all {QUOTES.length} quotes
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {featured.map((quote) => {
              const meta = themeMeta(quote.theme);
              return (
                <figure
                  key={quote.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[var(--ink)]/12 bg-[var(--paper)] p-7"
                >
                  <span
                    aria-hidden
                    className="font-[family-name:var(--font-display)] text-5xl font-black leading-[0.4] text-[var(--gold)]"
                  >
                    &ldquo;
                  </span>
                  {quote.sanskrit ? (
                    <blockquote className="flex-1 space-y-3">
                      <p className="whitespace-pre-line font-[family-name:var(--font-display)] text-[15px] font-medium leading-7">
                        {quote.sanskrit}
                      </p>
                      <p className="text-sm leading-6 text-[var(--ink)]/65">{quote.text}</p>
                    </blockquote>
                  ) : (
                    <blockquote className="flex-1 font-[family-name:var(--font-display)] text-lg font-medium leading-7">
                      {quote.text}
                    </blockquote>
                  )}
                  <figcaption className="flex items-end justify-between gap-3 border-t border-[var(--ink)]/10 pt-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{quote.author}</p>
                      {quote.source ? (
                        <p className="truncate text-xs text-[var(--ink)]/50">{quote.source}</p>
                      ) : null}
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ backgroundColor: meta.bg, color: meta.text }}
                    >
                      {meta.label}
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- Closing CTA --- */}
      <section className="relative z-10 overflow-hidden bg-[var(--green)] text-[var(--paper)]">
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-10 select-none font-[family-name:var(--font-display)] text-[26rem] font-black leading-none text-[var(--paper)]/[0.06]"
        >
          ₹₹
        </span>
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center sm:py-32">
          <h2 className="mx-auto max-w-[18ch] font-[family-name:var(--font-display)] text-[clamp(2.4rem,6vw,5rem)] font-black leading-[1] tracking-[-0.02em]">
            Your rokda is waiting for a plan.
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[var(--paper)]/75">
            Set your salary, list what goes out, and watch the months ahead come into focus.
          </p>
          <Link
            href="/login"
            className="focus-ring group mt-9 inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-8 py-4 text-[15px] font-bold text-[var(--ink)] transition-transform hover:-translate-y-0.5"
          >
            Get started free
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="relative z-10 mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-md bg-[var(--ink)] text-sm font-[family-name:var(--font-display)] font-black text-[var(--paper)]"
          >
            ₹₹
          </span>
          <span className="text-sm font-semibold">Raghu Rokda</span>
        </div>
        <p className="text-sm text-[var(--ink)]/50">
          Plan your money, the desi way. &copy; {new Date().getFullYear()}
        </p>
        <nav className="flex items-center gap-5 text-sm font-medium text-[var(--ink)]/70">
          <Link href="/quotes" className="focus-ring rounded transition-colors hover:text-[var(--ink)]">
            Quotes
          </Link>
          <Link href="/login" className="focus-ring rounded transition-colors hover:text-[var(--ink)]">
            Sign in
          </Link>
        </nav>
      </footer>
    </div>
  );
}
