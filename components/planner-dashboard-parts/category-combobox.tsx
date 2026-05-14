"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";

type CategoryComboboxProps = {
  formId?: string;
  name: string;
  options: string[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
};

export function CategoryCombobox({
  formId,
  name,
  options,
  defaultValue = "",
  placeholder = "Select or create",
  required = false
}: CategoryComboboxProps) {
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  function commit(next: string) {
    setValue(next);
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
    <div ref={containerRef} className="relative">
      <input type="hidden" form={formId} name={name} value={value} required={required} />
      <button
        type="button"
        onClick={() => {
          setIsOpen((open) => !open);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="focus-ring flex h-14 w-full items-center justify-between px-4 py-3 text-left hover:bg-row-hover"
      >
        {value ? (
          <span className="inline-flex rounded bg-brand-50 px-2 py-1 text-xs font-medium text-teal-900">
            {value}
          </span>
        ) : (
          <span className="text-ink-100">{placeholder}</span>
        )}
        <ChevronDown className="size-4 text-ink-300" aria-hidden />
      </button>
      {isOpen ? (
        <div className="absolute left-0 top-full z-30 mt-1 w-64 overflow-hidden rounded-lg border border-line bg-white shadow-lg">
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
                  <span className="inline-flex rounded bg-brand-50 px-2 py-1 text-xs font-medium text-teal-900">
                    {option}
                  </span>
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
        </div>
      ) : null}
    </div>
  );
}
