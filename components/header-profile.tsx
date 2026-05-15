"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, Save, UserRound } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { updateSalary } from "@/app/actions/planner";

type HeaderProfileProps = {
  userEmail: string;
  monthlySalary: number;
};

export function HeaderProfile({ userEmail, monthlySalary }: HeaderProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initial = userEmail.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="focus-ring flex size-7 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white hover:bg-ink-700"
        aria-label="Open profile menu"
      >
        {initial}
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-72 rounded-lg border border-line bg-white p-4 shadow-lg"
        >
          <div className="flex items-center gap-2 border-b border-line-faint pb-3 text-sm">
            <UserRound className="size-4 text-ink-500" />
            <span className="truncate text-ink-700" title={userEmail}>
              {userEmail}
            </span>
          </div>

          <form action={updateSalary} className="grid gap-2 pt-3">
            <label className="grid gap-1 text-xs font-medium uppercase tracking-wide text-ink-400">
              Monthly salary
              <input
                className="focus-ring rounded-md border border-line px-3 py-2 text-sm"
                name="monthly_salary"
                type="number"
                min="0"
                step="1"
                defaultValue={monthlySalary}
              />
            </label>
            <button
              type="submit"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink-900 px-3 py-2 text-sm font-medium text-white hover:bg-ink-700"
            >
              <Save className="size-4" />
              Save
            </button>
          </form>

          <form action={signOut} className="pt-3">
            <button
              type="submit"
              className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md border border-line px-3 py-2 text-sm hover:bg-canvas"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
