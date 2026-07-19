"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  createCategory,
  deleteCategory,
  reorderCategories,
  updateCategory
} from "@/app/actions/planner";
import type { DashboardCategory } from "@/lib/types";
import { CategoryTag } from "./category-tag";

const COLORS = ["gray", "brown", "blue", "green", "yellow", "orange", "red", "pink", "purple"] as const;

type CategoryDraft = { name: string; emoji: string; color: string };
const EMPTY_DRAFT: CategoryDraft = { name: "", emoji: "", color: "gray" };

export function CategoryManager({
  categories,
  onClose
}: {
  categories: DashboardCategory[];
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<CategoryDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function beginEdit(category: DashboardCategory) {
    setEditingId(category.id);
    setDraft({ name: category.name, emoji: category.emoji ?? "", color: category.color });
    setError(null);
  }

  function resetDraft() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
  }

  function run(action: () => Promise<void>, onSuccess = resetDraft) {
    setError(null);
    startTransition(() => {
      void action()
        .then(onSuccess)
        .catch((actionError) => {
          setError(actionError instanceof Error ? actionError.message : "Could not update categories.");
        });
    });
  }

  function saveDraft() {
    const input = { name: draft.name, emoji: draft.emoji || null, color: draft.color };
    run(() => editingId ? updateCategory(editingId, input) : createCategory(input));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    run(() => reorderCategories(next.map((category) => category.id)), () => undefined);
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/25 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-manager-title"
        className="flex max-h-[min(720px,90vh)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-line-faint px-4 py-3">
          <div>
            <h2 id="category-manager-title" className="font-semibold text-ink-900">Manage categories</h2>
            <p className="text-xs text-ink-400">Create, rename, style, reorder, or remove categories.</p>
          </div>
          <button type="button" onClick={onClose} className="focus-ring rounded p-1.5 hover:bg-canvas" aria-label="Close category manager">
            <X className="size-4" />
          </button>
        </header>

        <div className="overflow-y-auto p-3">
          <ul className="space-y-1">
            {categories.map((category, index) => {
              const isOther = category.name.toLowerCase() === "other";
              return (
                <li key={category.id} className="flex items-center gap-2 rounded-lg border border-transparent px-2 py-2 hover:border-line-faint hover:bg-canvas">
                  <div className="min-w-0 flex-1">
                    <CategoryTag value={category.name} emoji={category.emoji} color={category.color} />
                  </div>
                  <button type="button" disabled={isPending || index === 0} onClick={() => move(index, -1)} className="focus-ring rounded p-1 text-ink-400 hover:bg-white disabled:opacity-30" aria-label={`Move ${category.name} up`}>
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" disabled={isPending || index === categories.length - 1} onClick={() => move(index, 1)} className="focus-ring rounded p-1 text-ink-400 hover:bg-white disabled:opacity-30" aria-label={`Move ${category.name} down`}>
                    <ArrowDown className="size-4" />
                  </button>
                  <button type="button" disabled={isPending} onClick={() => beginEdit(category)} className="focus-ring rounded p-1 text-ink-400 hover:bg-white hover:text-ink-700" aria-label={`Edit ${category.name}`}>
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isPending || isOther}
                    onClick={() => {
                      if (window.confirm(`Delete “${category.name}”? Its budget items will move to Other.`)) {
                        run(() => deleteCategory(category.id), () => undefined);
                      }
                    }}
                    className="focus-ring rounded p-1 text-ink-400 hover:bg-white hover:text-danger-700 disabled:opacity-30"
                    aria-label={isOther ? "Other cannot be deleted" : `Delete ${category.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-line-faint bg-canvas p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">
            {editingId ? "Edit category" : "New category"}
          </p>
          <div className="grid grid-cols-[56px_1fr] gap-2">
            <input
              value={draft.emoji}
              onChange={(event) => setDraft((current) => ({ ...current, emoji: event.target.value }))}
              maxLength={16}
              placeholder="Emoji"
              aria-label="Category emoji"
              className="focus-ring rounded-md border border-line bg-white px-2 py-2 text-center text-sm"
            />
            <input
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              maxLength={60}
              placeholder="Category name"
              aria-label="Category name"
              className="focus-ring rounded-md border border-line bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Category color">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, color }))}
                className={`focus-ring rounded-md p-0.5 ${draft.color === color ? "ring-2 ring-ink-700" : ""}`}
                aria-label={`Use ${color}`}
                aria-pressed={draft.color === color}
              >
                <CategoryTag value="Aa" color={color} />
              </button>
            ))}
          </div>
          {error ? <p className="mt-2 text-sm text-danger-700">{error}</p> : null}
          <div className="mt-3 flex justify-end gap-2">
            {editingId ? (
              <button type="button" disabled={isPending} onClick={resetDraft} className="focus-ring rounded-md px-3 py-2 text-sm text-ink-500 hover:bg-white">Cancel</button>
            ) : null}
            <button
              type="button"
              disabled={isPending || !draft.name.trim()}
              onClick={saveDraft}
              className="focus-ring inline-flex items-center gap-2 rounded-md bg-ink-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {editingId ? <Check className="size-4" /> : <Plus className="size-4" />}
              {editingId ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body
  );
}
