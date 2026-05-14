"use client";

import { useState, useTransition } from "react";
import type { FormEvent, ReactNode } from "react";
import { GripVertical, Plus, Save, SlidersHorizontal, Trash2, X } from "lucide-react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { deleteItem } from "@/app/actions/planner";
import { formatCurrency } from "@/lib/finance";
import type { ForecastEntry, PlannerKind } from "@/lib/types";
import type { CreateAction, TableHeader } from "./types";

type SectionItem = { id: string; amount: number };

type PlannerSectionProps<T extends SectionItem> = {
  kind: PlannerKind;
  title: string;
  items: T[];
  headers: TableHeader[];
  onItemsChange: (items: T[]) => void;
  onSortAmount: () => void;
  createAction: CreateAction;
  renderNewCells: (formId: string) => ReactNode[];
  renderCells: (item: T, ctx: { forecast?: ForecastEntry }) => ReactNode[];
  forecastById: Map<string, ForecastEntry> | null;
};

export function PlannerSection<T extends SectionItem>({
  kind,
  title,
  items,
  headers,
  onItemsChange,
  onSortAmount,
  createAction,
  renderNewCells,
  renderCells,
  forecastById
}: PlannerSectionProps<T>) {
  const [isAdding, setIsAdding] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const formId = `new-${kind}-item-form`;
  const dragEnabled = items.length > 1;
  const amountColumnIndex = headers.findIndex((header) => header.label === "Amount");
  const amountTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    onItemsChange(arrayMove(items, oldIndex, newIndex));
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setIsSaving(true);

    const form = event.currentTarget;
    try {
      await createAction(new FormData(form));
      form.reset();
      setIsAdding(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not save item.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-md border border-line-faint bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-line-faint p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-ink-500">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={onSortAmount}
          disabled={items.length < 2}
          className="focus-ring inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-semibold hover:bg-canvas disabled:opacity-40"
        >
          <SlidersHorizontal className="size-4" />
          Amount
        </button>
      </div>

      {isAdding ? <form id={formId} onSubmit={handleCreateSubmit} /> : null}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-[15px]">
              <thead className="bg-white text-left font-medium text-ink-400">
                <tr className="h-12 border-b border-line-faint">
                  <th className="w-10 px-2 py-2" aria-label="Reorder" />
                  {headers.map((header) => (
                    <th
                      key={header.label}
                      className="border-r border-line-faint px-4 py-2 font-medium last:border-r-0"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="text-[#a29d98]">{header.icon}</span>
                        {header.label}
                      </span>
                    </th>
                  ))}
                  <th className="w-12 px-2 py-2" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <SortableRow
                    key={item.id}
                    id={item.id}
                    kind={kind}
                    dragEnabled={dragEnabled}
                    cells={renderCells(item, { forecast: forecastById?.get(item.id) })}
                  />
                ))}
                {isAdding ? (
                  <NewItemEditRow
                    cells={renderNewCells(formId)}
                    error={submitError}
                    formId={formId}
                    isSaving={isSaving}
                    onCancel={() => setIsAdding(false)}
                  />
                ) : (
                  <NewItemButtonRow
                    columnCount={headers.length}
                    onClick={() => {
                      setSubmitError(null);
                      setIsAdding(true);
                    }}
                  />
                )}
              </tbody>
              {items.length > 0 && amountColumnIndex >= 0 ? (
                <tfoot>
                  <tr className="h-14 border-t border-line bg-canvas font-semibold">
                    <td className="px-2 py-2" />
                    {headers.map((header, index) => (
                      <td
                        key={header.label}
                        className="border-r border-line-soft px-4 py-3 align-middle last:border-r-0"
                      >
                        {index === amountColumnIndex ? (
                          <span className="tabular-nums text-ink-900">
                            {formatCurrency(amountTotal)}
                          </span>
                        ) : null}
                      </td>
                    ))}
                    <td className="px-2 py-2" />
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}

function SortableRow({
  id,
  kind,
  dragEnabled,
  cells
}: {
  id: string;
  kind: PlannerKind;
  dragEnabled: boolean;
  cells: ReactNode[];
}) {
  const [, startTransition] = useTransition();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !dragEnabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group h-14 border-b border-line-soft bg-white last:border-b-0 hover:bg-row-hover ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <td className="px-2 py-2 align-top">
        {dragEnabled ? (
          <button
            type="button"
            className="focus-ring rounded p-1 text-ink-300 opacity-70 hover:bg-brand-50 hover:text-ink-900 group-hover:opacity-100"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-5" />
          </button>
        ) : null}
      </td>
      {cells.map((cell, index) => (
        <td
          key={index}
          className="max-w-[340px] border-r border-line-soft px-4 py-3 align-middle last:border-r-0"
        >
          {cell}
        </td>
      ))}
      <td className="px-2 py-2 text-right align-top">
        <button
          type="button"
          onClick={() => startTransition(() => deleteItem(kind, id))}
          className="focus-ring rounded p-1 text-ink-300 hover:bg-danger-50 hover:text-danger-700"
          aria-label="Delete item"
        >
          <Trash2 className="size-5" />
        </button>
      </td>
    </tr>
  );
}

function NewItemButtonRow({ columnCount, onClick }: { columnCount: number; onClick: () => void }) {
  return (
    <tr className="h-14 border-b border-line-soft bg-white hover:bg-row-hover">
      <td colSpan={columnCount + 2} className="px-5 py-3">
        <button
          type="button"
          onClick={onClick}
          className="focus-ring inline-flex items-center gap-3 rounded px-2 py-1 text-xl font-medium text-ink-200 hover:text-[#5f5a55]"
        >
          <Plus className="size-5" />
          New item
        </button>
      </td>
    </tr>
  );
}

function NewItemEditRow({
  cells,
  error,
  formId,
  isSaving,
  onCancel
}: {
  cells: ReactNode[];
  error: string | null;
  formId: string;
  isSaving: boolean;
  onCancel: () => void;
}) {
  return (
    <>
      <tr className="h-14 border-b border-line-soft bg-white">
        <td className="px-2 py-2 align-middle text-ink-100">
          <Plus className="mx-auto size-5" />
        </td>
        {cells.map((cell, index) => (
          <td
            key={index}
            className="max-w-[340px] border-r border-line-soft p-0 align-middle last:border-r-0"
          >
            {cell}
          </td>
        ))}
        <td className="px-2 py-2 align-middle">
          <div className="flex items-center justify-end gap-1">
            <button
              type="submit"
              form={formId}
              disabled={isSaving}
              className="focus-ring rounded p-1.5 text-teal-700 hover:bg-brand-50 disabled:opacity-50"
              aria-label="Save new item"
            >
              <Save className="size-4" />
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="focus-ring rounded p-1.5 text-[#8a8580] hover:bg-[#f3f2ef] disabled:opacity-50"
              aria-label="Cancel new item"
            >
              <X className="size-4" />
            </button>
          </div>
        </td>
      </tr>
      {error ? (
        <tr className="border-b border-line-soft bg-danger-50">
          <td />
          <td colSpan={cells.length + 1} className="px-4 py-2 text-sm text-danger-700">
            {error}
          </td>
        </tr>
      ) : null}
    </>
  );
}
