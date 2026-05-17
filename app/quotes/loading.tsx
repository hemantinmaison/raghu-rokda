import { LoadingShell, SkeletonBar } from "@/components/skeletons";

export default function QuotesLoading() {
  return (
    <LoadingShell>
      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6">
        <div className="space-y-2.5">
          <SkeletonBar className="h-7 w-44" />
          <SkeletonBar className="h-4 w-full max-w-md" />
        </div>

        <div className="flex flex-wrap gap-2">
          {[64, 104, 132, 116, 124, 96, 72].map((width, index) => (
            <SkeletonBar key={index} className="h-9" style={{ width }} />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-lg border border-line-faint bg-white p-5"
            >
              <SkeletonBar className="size-5" />
              <div className="flex-1 space-y-2">
                <SkeletonBar className="h-4 w-full" />
                <SkeletonBar className="h-4 w-full" />
                <SkeletonBar className="h-4 w-2/3" />
              </div>
              <div className="flex items-end justify-between gap-3 pt-1">
                <div className="space-y-1.5">
                  <SkeletonBar className="h-4 w-24" />
                  <SkeletonBar className="h-3 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <SkeletonBar className="h-5 w-10" />
                  <SkeletonBar className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LoadingShell>
  );
}
