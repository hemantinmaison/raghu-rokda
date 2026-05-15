"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Plus } from "lucide-react";
import { CategoryTag } from "./category-tag";

type CategoryComboboxProps = {
  formId?: string;
  name: string;
  options: string[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  variant?: "default" | "compact";
  onValueChange?: (value: string) => void;
};

const POPOVER_WIDTH = 260;

export function CategoryCombobox({
  formId,
  name,
  options,
  value: controlledValue,
  defaultValue = "",
  placeholder = "Select or create",
  required = false,
  disabled = false,
  variant = "default",
  onValueChange
}: CategoryComboboxProps) {
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedValue = controlledValue ?? value;
  const isCompact = variant === "compact";
  const normalizedQuery = query.trim();
  const filtered = useMemo(() => {
    if (normalizedQuery.length === 0) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(normalizedQuery.toLowerCase())
    );
  }, [normalizedQuery, options]);

  const canCreate =
    normalizedQuery.length > 0 &&
    !options.some((option) => option.toLowerCase() === normalizedQuery.toLowerCase());

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    function place() {
      const rect = buttonRef.current!.getBoundingClientRect();
      const maxLeft = window.innerWidth - POPOVER_WIDTH - 8;
      setPosition({
        top: rect.bottom + 4,
        left: Math.min(Math.max(8, rect.left), maxLeft)
      });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setIsOpen(false);
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

  function commit(next: string) {
    if (controlledValue === undefined) setValue(next);
    onValueChange?.(next);
    setQuery("");
    setIsOpen(false);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      const choice = filtered[0] ?? (canCreate ? normalizedQuery : "");
      if (choice) commit(choice);
    }
  }

  return (
    <>
      {formId ? (
        <input type="hidden" form={formId} name={name} value={selectedValue} required={required} />
      ) : null}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          setIsOpen((open) => !open);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={`focus-ring flex min-w-0 items-center text-left text-sm hover:bg-row-hover disabled:cursor-not-allowed disabled:opacity-60 ${
          isCompact
            ? "h-7 max-w-full gap-1.5 rounded px-1.5 py-1"
            : "h-11 w-full justify-between px-3 py-2"
        }`}
      >
        <span className="min-w-0">
          {selectedValue ? (
            <CategoryTag value={selectedValue} />
          ) : (
            <span className="text-ink-100">{placeholder}</span>
          )}
        </span>
        <ChevronDown className="size-4 shrink-0 text-ink-300" aria-hidden />
      </button>
      {isOpen && position && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popoverRef}
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                width: POPOVER_WIDTH,
                zIndex: 1000
              }}
              className="overflow-hidden rounded-lg border border-line bg-white shadow-lg"
            >
              <div className="border-b border-line-faint p-2">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search or create"
                  className="focus-ring w-full rounded border border-line px-2 py-1 text-sm"
                />
              </div>
              <ul className="max-h-60 overflow-y-auto py-1 text-sm">
                {filtered.map((option) => (
                  <li key={option}>
                    <button
                      type="button"
                      onClick={() => commit(option)}
                      className="flex w-full items-center px-3 py-2 text-left hover:bg-canvas"
                    >
                      <CategoryTag value={option} />
                    </button>
                  </li>
                ))}
                {canCreate ? (
                  <li>
                    <button
                      type="button"
                      onClick={() => commit(normalizedQuery)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-ink-700 hover:bg-canvas"
                    >
                      <Plus className="size-4 text-ink-400" aria-hidden />
                      <span>
                        Create <strong>&ldquo;{normalizedQuery}&rdquo;</strong>
                      </span>
                    </button>
                  </li>
                ) : null}
                {filtered.length === 0 && !canCreate ? (
                  <li className="px-3 py-2 text-ink-300">No categories yet</li>
                ) : null}
              </ul>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
