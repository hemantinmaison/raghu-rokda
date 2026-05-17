export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas px-5 text-ink-900">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-ink-900 text-lg font-semibold text-white">
          RR
        </span>
        <span className="text-lg font-medium tracking-tight">Raghu Rokda</span>
      </div>
      <div
        className="h-1 w-44 overflow-hidden rounded-full bg-line-soft"
        role="progressbar"
        aria-label="Loading"
      >
        <div className="rr-loadbar h-full w-1/3 rounded-full bg-ink-900" />
      </div>
    </main>
  );
}
