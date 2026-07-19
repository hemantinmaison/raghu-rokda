"use client";

import { useEffect, useState } from "react";

const WORDS = ["rokda", "Monthly Budget", "Debt", "Wishlist"];

export function RotatingHeroWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const timeout = window.setTimeout(() => {
      setIndex((current) => (current + 1) % WORDS.length);
    }, index === 0 ? 5000 : 3000);

    return () => window.clearTimeout(timeout);
  }, [index]);

  return (
    <>
      <span className="inline-flex items-baseline italic text-[var(--green)]" aria-hidden>
        <span className="inline-grid overflow-hidden pb-[0.12em] align-bottom">
          <span key={WORDS[index]} className="rr-word-enter whitespace-nowrap">
            {WORDS[index]}
          </span>
        </span>
        <span className="text-[var(--ink)]">.</span>
      </span>
      <span className="sr-only">finances.</span>
    </>
  );
}
