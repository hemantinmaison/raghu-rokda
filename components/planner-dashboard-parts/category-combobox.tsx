"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Plus, Settings2 } from "lucide-react";
import type { DashboardCategory } from "@/lib/types";
import { CategoryTag } from "./category-tag";

type CategoryComboboxProps = {
  formId?: string;
  name: string;
  options: DashboardCategory[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  variant?: "default" | "compact";
  onValueChange?: (value: string) => void;
  onManageCategories?: () => void;
};

const POPOVER_WIDTH = 260;
const POPOVER_MAX_HEIGHT = 300;

type PopoverPosition = { left: number; top?: number; bottom?: number };

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
  onValueChange,
  onManageCategories
}: CategoryComboboxProps) {
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedValue = controlledValue ?? value;
  const isCompact = variant === "compact";
  const normalizedQuery = query.trim();
  const filtered = useMemo(() => {
    if (normalizedQuery.length === 0) return options;
    return options.filter((option) =>
      option.name.toLowerCase().includes(normalizedQuery.toLowerCase())
    );
  }, [normalizedQuery, options]);

  const canCreate =
    normalizedQuery.length > 0 &&
    !options.some((option) => option.name.toLowerCase() === normalizedQuery.toLowerCase());
  const selectedCategory = options.find(
    (option) => option.name.toLowerCase() === selectedValue.toLowerCase()
  );

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    function place() {
      const rect = buttonRef.current!.getBoundingClientRect();
      const maxLeft = window.innerWidth - POPOVER_WIDTH - 8;
      const left = Math.min(Math.max(8, rect.left), maxLeft);
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < POPOVER_MAX_HEIGHT && rect.top > spaceBelow;
      if (openUp) {
        setPosition({ left, bottom: window.innerHeight - rect.top + 4 });
      } else {
        setPosition({ left, top: rect.bottom + 4 });
      }
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
      const choice = filtered[0]?.name ?? (canCreate ? normalizedQuery : "");
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
        className={`focus-ring flex w-full min-w-0 items-center justify-between text-left text-sm hover:bg-row-hover disabled:cursor-not-allowed disabled:opacity-60 ${
          isCompact ? "h-7 rounded px-1.5 py-1" : "h-11 px-3 py-2"
        }`}
      >
        <span className="min-w-0">
          {selectedValue ? (
            <CategoryTag
              value={selectedValue}
              emoji={selectedCategory?.emoji}
              color={selectedCategory?.color}
            />
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
                bottom: position.bottom,
                left: position.left,
                width: POPOVER_WIDTH,
                maxHeight: POPOVER_MAX_HEIGHT,
                zIndex: 1000
              }}
              className="flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-lg"
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
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => commit(option.name)}
                      className="flex w-full items-center px-3 py-2 text-left hover:bg-canvas"
                    >
                      <CategoryTag value={option.name} emoji={option.emoji} color={option.color} />
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
              {onManageCategories ? (
                <div className="border-t border-line-faint p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onManageCategories();
                    }}
                    className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-ink-500 hover:bg-canvas hover:text-ink-800"
                  >
                    <Settings2 className="size-4" aria-hidden />
                    Manage categories
                  </button>
                </div>
              ) : null}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
