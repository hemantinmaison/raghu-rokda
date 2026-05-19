"use client";

import { useState, useTransition } from "react";
import type { FormEvent, ReactNode } from "react";
import { GripVertical, Plus, Save, Trash2, X } from "lucide-react";
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
import type { CreateAction, SectionConfigContext, TableHeader } from "./types";

type SectionItem = { id: string; amount: number };

type PlannerSectionProps<T extends SectionItem> = {
  kind: PlannerKind;
  title: string;
  items: T[];
  headers: TableHeader[];
  onItemsChange: (items: T[]) => void;
  createAction: CreateAction;
  renderNewCells: (formId: string, ctx: SectionConfigContext) => ReactNode[];
  renderCells: (item: T, ctx: { forecast?: ForecastEntry } & SectionConfigContext) => ReactNode[];
  forecastById: Map<string, ForecastEntry> | null;
  sectionContext: SectionConfigContext;
  /** Replaces the item count in the top-right of the section title. */
  headerRight?: ReactNode;
  /** Rendered below the table, inside the section card. */
  footerNote?: ReactNode;
};

export function PlannerSection<T extends SectionItem>({
  kind,
  title,
  items,
  headers,
  onItemsChange,
  createAction,
  renderNewCells,
  renderCells,
  forecastById,
  sectionContext,
  headerRight,
  footerNote
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
    <section className="rounded-md border border-line-faint bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-line-faint p-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        {headerRight ?? (
          <p className="text-sm text-ink-400">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {isAdding ? <form id={formId} onSubmit={handleCreateSubmit} /> : null}

      <DndContext
        id={`dnd-${kind}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] table-fixed border-collapse text-sm">
              <colgroup>
                <col style={{ width: 36 }} />
                {headers.map((header) => (
                  <col key={header.label} style={{ width: header.width }} />
                ))}
                <col style={{ width: 40 }} />
              </colgroup>
              <thead className="bg-white text-[13px] font-normal text-ink-400">
                <tr className="h-10 border-b border-line-faint">
                  <th className="w-9 px-2 py-2" aria-label="Reorder" />
                  {headers.map((header) => (
                    <th
                      key={header.label}
                      className={`border-r border-line-faint px-3 py-2 font-normal last:border-r-0 ${
                        header.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-[#a29d98]">{header.icon}</span>
                        {header.label}
                      </span>
                    </th>
                  ))}
                  <th className="w-10 px-2 py-2" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <SortableRow
                    key={item.id}
                    id={item.id}
                    kind={kind}
                    dragEnabled={dragEnabled}
                    headers={headers}
                    cells={renderCells(item, {
                      ...sectionContext,
                      forecast: forecastById?.get(item.id)
                    })}
                  />
                ))}
                {isAdding ? (
                  <NewItemEditRow
                    cells={renderNewCells(formId, sectionContext)}
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
                  <tr className="h-11 border-t border-line-faint bg-canvas font-medium">
                    <td className="px-2 py-2" />
                    {headers.map((header, index) => (
                      <td
                        key={header.label}
                        className={`border-r border-line-soft px-3 py-2 align-middle last:border-r-0 ${
                          header.align === "right" ? "text-right" : ""
                        }`}
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

      {footerNote}
    </section>
  );
}

function SortableRow({
  id,
  kind,
  dragEnabled,
  headers,
  cells
}: {
  id: string;
  kind: PlannerKind;
  dragEnabled: boolean;
  headers: TableHeader[];
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
      className={`group h-11 border-b border-line-soft bg-white last:border-b-0 hover:bg-row-hover ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <td className="px-2 py-2 align-middle">
        {dragEnabled ? (
          <button
            type="button"
            className="focus-ring cursor-grab rounded p-1 text-ink-300 opacity-0 transition-opacity hover:bg-canvas hover:text-ink-700 focus-visible:opacity-100 active:cursor-grabbing group-hover:opacity-100"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        ) : null}
      </td>
      {cells.map((cell, index) => (
        <td
          key={index}
          className={`max-w-[340px] border-r border-line-soft px-3 py-2 align-middle last:border-r-0 ${
            headers[index]?.align === "right" ? "text-right" : ""
          }`}
        >
          {cell}
        </td>
      ))}
      <td className="px-2 py-2 text-right align-middle">
        <button
          type="button"
          onClick={() => startTransition(() => deleteItem(kind, id))}
          className="focus-ring rounded p-1 text-ink-300 opacity-0 transition-opacity hover:bg-danger-50 hover:text-danger-700 focus-visible:opacity-100 group-hover:opacity-100"
          aria-label="Delete item"
        >
          <Trash2 className="size-4" />
        </button>
      </td>
    </tr>
  );
}

function NewItemButtonRow({ columnCount, onClick }: { columnCount: number; onClick: () => void }) {
  return (
    <tr className="h-11 border-b border-line-soft bg-white hover:bg-row-hover">
      <td colSpan={columnCount + 2} className="px-3 py-2">
        <button
          type="button"
          onClick={onClick}
          className="focus-ring inline-flex items-center gap-2 rounded px-2 py-1 text-sm text-ink-300 hover:text-ink-700"
        >
          <Plus className="size-4" />
          New
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
      <tr className="h-11 border-b border-line-soft bg-white">
        <td className="px-2 py-2 align-middle text-ink-100">
          <Plus className="mx-auto size-4" />
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
