"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-canvas px-5 py-12 text-ink-900">
      <section className="mx-auto max-w-xl rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          We hit an unexpected error. You can try again, or refresh the page.
        </p>
        <button
          type="button"
          onClick={reset}
          className="focus-ring mt-5 inline-flex rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
