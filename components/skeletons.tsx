import type { CSSProperties, ReactNode } from "react";

/** Header placeholder matching AppShell — real brand, skeleton actions. */
export function SkeletonHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line-faint bg-white">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-6 items-center justify-center rounded-md bg-ink-900 text-[13px] font-semibold text-white">
            ₹₹
          </span>
          <span className="text-sm font-medium text-ink-900">Raghu Rokda</span>
        </div>
        <div className="flex animate-pulse items-center gap-2">
          <div className="h-8 w-20 rounded-md bg-line" />
          <div className="size-7 rounded-full bg-line" />
        </div>
      </div>
    </header>
  );
}

/** Full-page shell for content skeletons: skeleton header + pulsing body. */
export function LoadingShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-canvas text-ink-900">
      <SkeletonHeader />
      <div className="animate-pulse">{children}</div>
    </main>
  );
}

/** A grey placeholder bar. */
export function SkeletonBar({
  className,
  style
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div className={`rounded bg-line ${className ?? ""}`} style={style} />;
}
