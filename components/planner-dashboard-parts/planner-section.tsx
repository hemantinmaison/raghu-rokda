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
import { deleteItem, reorderItems } from "@/app/actions/planner";
import type { PlannerKind } from "@/lib/types";
import type { CreateAction, TableHeader } from "./types";

export function PlannerSection<T extends { id: string; amount: number }>({
  kind,
  title,
  items,
  headers,
  onItemsChange,
  onSortAmount,
  createAction,
  renderNewCells,
  renderCells
}: {
  kind: PlannerKind;
  title: string;
  items: T[];
  headers: TableHeader[];
  onItemsChange: (items: T[]) => void;
  onSortAmount: () => void;
  createAction: CreateAction;
  renderNewCells: (formId: string) => ReactNode[];
  renderCells: (item: T) => ReactNode[];
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [, startTransition] = useTransition();
  const formId = `new-${kind}-item-form`;
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const orderedItems = arrayMove(items, oldIndex, newIndex);
    onItemsChange(orderedItems);
    startTransition(() => reorderItems(kind, orderedItems.map((item) => item.id)));
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setIsSaving(true);

    try {
      await createAction(new FormData(event.currentTarget));
      event.currentTarget.reset();
      setIsAdding(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not save item.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-md border border-[#e7e5e2] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#e7e5e2] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-[#626a73]">
            {items.length} item{items.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={onSortAmount}
          className="focus-ring inline-flex items-center gap-2 rounded-md border border-[#dde2dc] px-3 py-2 text-sm font-semibold hover:bg-[#f7f8f3]"
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
              <thead className="bg-white text-left font-medium text-[#7d7772]">
                <tr className="h-12 border-b border-[#e7e5e2]">
                  <th className="w-10 px-2 py-2" aria-label="Reorder" />
                  {headers.map((header) => (
                    <th
                      key={header.label}
                      className="border-r border-[#e7e5e2] px-4 py-2 font-medium last:border-r-0"
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
                  <SortableRow key={item.id} id={item.id} kind={kind} cells={renderCells(item)} />
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
  cells
}: {
  id: string;
  kind: PlannerKind;
  cells: ReactNode[];
}) {
  const [, startTransition] = useTransition();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group h-14 border-b border-[#efeeeb] bg-white last:border-b-0 hover:bg-[#fbfaf8] ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <td className="px-2 py-2 align-top">
        <button
          type="button"
          className="focus-ring rounded p-1 text-[#8a9199] opacity-70 hover:bg-[#eef4f1] hover:text-[#171a1f] group-hover:opacity-100"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
      </td>
      {cells.map((cell, index) => (
        <td key={index} className="max-w-[340px] border-r border-[#efeeeb] px-4 py-3 align-middle last:border-r-0">
          {cell}
        </td>
      ))}
      <td className="px-2 py-2 text-right align-top">
        <button
          type="button"
          onClick={() => startTransition(() => deleteItem(kind, id))}
          className="focus-ring rounded p-1 text-[#8a9199] hover:bg-red-50 hover:text-[#b42318]"
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
    <tr className="h-14 border-b border-[#efeeeb] bg-white hover:bg-[#fbfaf8]">
      <td colSpan={columnCount + 2} className="px-5 py-3">
        <button
          type="button"
          onClick={onClick}
          className="focus-ring inline-flex items-center gap-3 rounded px-2 py-1 text-xl font-medium text-[#9b9690] hover:text-[#5f5a55]"
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
      <tr className="h-14 border-b border-[#efeeeb] bg-white">
        <td className="px-2 py-2 align-middle text-[#b8b3ad]">
          <Plus className="mx-auto size-5" />
        </td>
        {cells.map((cell, index) => (
          <td key={index} className="max-w-[340px] border-r border-[#efeeeb] p-0 align-middle last:border-r-0">
            {cell}
          </td>
        ))}
        <td className="px-2 py-2 align-middle">
          <div className="flex items-center justify-end gap-1">
            <button
              type="submit"
              form={formId}
              disabled={isSaving}
              className="focus-ring rounded p-1.5 text-teal-700 hover:bg-[#eef4f1] disabled:opacity-50"
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
        <tr className="border-b border-[#efeeeb] bg-red-50">
          <td />
          <td colSpan={cells.length + 1} className="px-4 py-2 text-sm text-[#b42318]">
            {error}
          </td>
        </tr>
      ) : null}
    </>
  );
}
