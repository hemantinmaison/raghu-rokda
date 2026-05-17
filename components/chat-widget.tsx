"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { createPlannerItems } from "@/app/actions/planner";
import { extractPlannerItemsAction, type ExtractedItem } from "@/app/actions/assistant";
import { formatCurrency } from "@/lib/finance";
import type { PlannerKind } from "@/lib/types";

type ProposalStatus = "pending" | "added" | "cancelled";

type Proposal = {
  tab: PlannerKind;
  items: ExtractedItem[];
  status: ProposalStatus;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  proposal?: Proposal;
};

const TAB_LABEL: Record<PlannerKind, string> = {
  budget: "Monthly Budget",
  debt: "Debt Management",
  wishlist: "Wishlist"
};

const ASK_SUGGESTIONS: Record<PlannerKind, string[]> = {
  budget: [
    "Where is most of my money going?",
    "How much am I saving each month?",
    "Which categories should I cut first?"
  ],
  debt: [
    "Which debt should I clear first?",
    "When will I be debt-free?",
    "How much interest am I carrying?"
  ],
  wishlist: [
    "What can I realistically afford soon?",
    "Which wishlist item is furthest away?",
    "How do I reach my goals faster?"
  ]
};

const INSERT_SUGGESTIONS: Record<PlannerKind, string[]> = {
  budget: [
    "Rent 15000, groceries 6000, electricity 1200",
    "Add a 500 phone recharge under Personal"
  ],
  debt: ["Home loan 2000000 at 8.5% for 240 months", "Credit card due 18000"],
  wishlist: ["New laptop 90000, Goa trip 40000", "AirPods 20000"]
};

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

function isItemValid(item: ExtractedItem): boolean {
  return item.name.trim().length > 0 && Number.isFinite(item.amount) && item.amount > 0;
}

const BUDGET_CATEGORY_LIST_ID = "rr-budget-categories";

export function ChatWidget({
  activeTab,
  budgetCategories
}: {
  activeTab: PlannerKind;
  budgetCategories: string[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [insertMode, setInsertMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleAsk(nextMessages: Message[]) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tab: activeTab,
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content }))
        })
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? "The assistant couldn't respond.");
      }
      setMessages((current) => [
        ...current,
        { id: uid(), role: "assistant", content: data.reply as string }
      ]);
    } catch (askError) {
      setError(askError instanceof Error ? askError.message : "Something went wrong.");
    }
  }

  async function handleExtract(text: string) {
    try {
      const result = await extractPlannerItemsAction(activeTab, text);
      if (!result.ok) throw new Error(result.error);
      const lead =
        result.skipped > 0
          ? `Found ${result.items.length} item(s) — ${result.skipped} skipped (missing details). Review, edit and confirm:`
          : `Found ${result.items.length} item(s). Review, edit and confirm:`;
      setMessages((current) => [
        ...current,
        {
          id: uid(),
          role: "assistant",
          content: lead,
          proposal: { tab: activeTab, items: result.items, status: "pending" }
        }
      ]);
    } catch (extractError) {
      setError(extractError instanceof Error ? extractError.message : "Couldn't read those items.");
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (trimmed.length === 0 || isLoading) return;

    const nextMessages = [...messages, { id: uid(), role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    if (insertMode) await handleExtract(trimmed);
    else await handleAsk(nextMessages);

    setIsLoading(false);
  }

  function patchProposal(messageId: string, update: (proposal: Proposal) => Proposal) {
    setMessages((current) =>
      current.map((m) =>
        m.id === messageId && m.proposal ? { ...m, proposal: update(m.proposal) } : m
      )
    );
  }

  function editItem(messageId: string, index: number, patch: Partial<ExtractedItem>) {
    patchProposal(messageId, (proposal) => ({
      ...proposal,
      items: proposal.items.map((item, i) => (i === index ? { ...item, ...patch } : item))
    }));
  }

  function removeItem(messageId: string, index: number) {
    patchProposal(messageId, (proposal) => ({
      ...proposal,
      items: proposal.items.filter((_, i) => i !== index)
    }));
  }

  async function confirmProposal(messageId: string) {
    const message = messages.find((m) => m.id === messageId);
    if (!message?.proposal || message.proposal.status !== "pending" || isLoading) return;
    const { tab, items } = message.proposal;
    if (items.length === 0 || !items.every(isItemValid)) return;

    setError(null);
    setIsLoading(true);
    try {
      const { inserted } = await createPlannerItems(tab, items);
      setMessages((current) =>
        current.map((m) =>
          m.id === messageId && m.proposal
            ? {
                ...m,
                content: `Added ${inserted} item(s) to your ${TAB_LABEL[tab]}.`,
                proposal: { ...m.proposal, status: "added" }
              }
            : m
        )
      );
      router.refresh();
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Could not add the items.");
    } finally {
      setIsLoading(false);
    }
  }

  function cancelProposal(messageId: string) {
    patchProposal(messageId, (proposal) =>
      proposal.status === "pending" ? { ...proposal, status: "cancelled" } : proposal
    );
    setMessages((current) =>
      current.map((m) =>
        m.id === messageId && m.proposal?.status === "cancelled"
          ? { ...m, content: "Cancelled — nothing was added." }
          : m
      )
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open money assistant"
        className="focus-ring fixed bottom-5 right-5 z-40 flex size-12 items-center justify-center rounded-full bg-ink-900 text-white shadow-lg transition-transform hover:-translate-y-0.5"
      >
        <MessageCircle className="size-5" />
      </button>
    );
  }

  const suggestions = insertMode ? INSERT_SUGGESTIONS[activeTab] : ASK_SUGGESTIONS[activeTab];

  return (
    <div className="fixed bottom-5 right-5 z-40 flex h-[560px] max-h-[calc(100vh-2.5rem)] w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl sm:w-[380px]">
      <datalist id={BUDGET_CATEGORY_LIST_ID}>
        {budgetCategories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>

      <header className="flex items-start justify-between gap-2 border-b border-line-faint px-4 py-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
            <Sparkles className="size-4 text-teal-700" />
            Money assistant
          </p>
          <p className="mt-0.5 text-xs text-ink-400">
            {insertMode
              ? `Adding items to your ${TAB_LABEL[activeTab]}`
              : `Answering from your ${TAB_LABEL[activeTab]} data`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close assistant"
          className="focus-ring -mr-1 rounded p-1 text-ink-400 hover:bg-canvas hover:text-ink-900"
        >
          <X className="size-4" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-ink-500">
              {insertMode
                ? `Describe the items to add to your ${TAB_LABEL[activeTab]} — I'll show them for you to review and confirm.`
                : `Ask anything about your ${TAB_LABEL[activeTab]} — I'll answer from your own data.`}
            </p>
            <div className="flex flex-col gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="focus-ring rounded-lg border border-line-faint px-3 py-2 text-left text-sm text-ink-700 hover:bg-canvas"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            if (message.proposal) {
              return (
                <ProposalCard
                  key={message.id}
                  lead={message.content}
                  proposal={message.proposal}
                  busy={isLoading}
                  onConfirm={() => confirmProposal(message.id)}
                  onCancel={() => cancelProposal(message.id)}
                  onEditItem={(index, patch) => editItem(message.id, index, patch)}
                  onRemoveItem={(index) => removeItem(message.id, index)}
                />
              );
            }
            return (
              <div
                key={message.id}
                className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-6 ${
                    message.role === "user" ? "bg-ink-900 text-white" : "bg-canvas text-ink-900"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })
        )}

        {isLoading ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2 text-sm text-ink-400">
              <Loader2 className="size-4 animate-spin" />
              {insertMode ? "Reading…" : "Thinking…"}
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700">
            {error}
          </p>
        ) : null}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="border-t border-line-faint p-3"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-ink-500">
            {insertMode ? "Insert mode — add items" : "Ask mode — questions"}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={insertMode}
            aria-label="Toggle insert mode"
            onClick={() => setInsertMode((value) => !value)}
            className={`focus-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              insertMode ? "bg-teal-700" : "bg-line"
            }`}
          >
            <span
              className={`inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
                insertMode ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send(input);
              }
            }}
            rows={1}
            maxLength={4000}
            placeholder={
              insertMode
                ? `Describe items to add to ${TAB_LABEL[activeTab].toLowerCase()}…`
                : `Ask about your ${TAB_LABEL[activeTab].toLowerCase()}…`
            }
            className="focus-ring max-h-28 min-h-9 flex-1 resize-none rounded-md border border-line px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isLoading || input.trim().length === 0}
            aria-label="Send message"
            className="focus-ring flex size-9 shrink-0 items-center justify-center rounded-md bg-ink-900 text-white hover:bg-ink-700 disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function ProposalCard({
  lead,
  proposal,
  busy,
  onConfirm,
  onCancel,
  onEditItem,
  onRemoveItem
}: {
  lead: string;
  proposal: Proposal;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onEditItem: (index: number, patch: Partial<ExtractedItem>) => void;
  onRemoveItem: (index: number) => void;
}) {
  const { tab, items, status } = proposal;
  const editable = status === "pending";
  const canConfirm = items.length > 0 && items.every(isItemValid);

  return (
    <div className="space-y-2">
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-lg bg-canvas px-3 py-2 text-sm leading-6 text-ink-900">
          {lead}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <p className="border-b border-line-faint bg-canvas px-3 py-1.5 text-xs font-medium text-ink-500">
          {items.length} item(s) → {TAB_LABEL[tab]}
        </p>

        {editable ? (
          <ul className="space-y-2 p-2">
            {items.map((item, index) => (
              <li key={index} className="space-y-1.5 rounded-md border border-line-faint p-2">
                <div className="flex items-center gap-1.5">
                  <span aria-hidden className="w-5 shrink-0 text-center text-base">
                    {item.emoji ?? "•"}
                  </span>
                  <input
                    value={item.name}
                    onChange={(event) => onEditItem(index, { name: event.target.value })}
                    placeholder="Name"
                    className="focus-ring min-w-0 flex-1 rounded border border-line px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveItem(index)}
                    aria-label="Remove item"
                    className="focus-ring rounded p-1 text-ink-300 hover:bg-danger-50 hover:text-danger-700"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-6">
                  <NumberField
                    value={item.amount}
                    placeholder="Amount ₹"
                    onChange={(value) => onEditItem(index, { amount: value ?? Number.NaN })}
                    className="w-24"
                  />
                  {tab === "budget" ? (
                    <input
                      value={item.category ?? ""}
                      onChange={(event) => onEditItem(index, { category: event.target.value })}
                      placeholder="Category"
                      list={BUDGET_CATEGORY_LIST_ID}
                      className="focus-ring min-w-0 flex-1 rounded border border-line px-2 py-1 text-sm"
                    />
                  ) : null}
                  {tab === "debt" ? (
                    <>
                      <NumberField
                        value={item.interest_rate ?? null}
                        placeholder="Interest %"
                        onChange={(value) => onEditItem(index, { interest_rate: value })}
                        className="w-24"
                      />
                      <NumberField
                        value={item.tenure_months ?? null}
                        placeholder="Tenure mo"
                        onChange={(value) => onEditItem(index, { tenure_months: value })}
                        className="w-24"
                      />
                    </>
                  ) : null}
                </div>
              </li>
            ))}
            {items.length === 0 ? (
              <li className="px-1 py-2 text-center text-xs text-ink-400">
                All items removed.
              </li>
            ) : null}
          </ul>
        ) : (
          <ul className="divide-y divide-line-faint">
            {items.map((item, index) => (
              <li key={index} className="flex items-center gap-2 px-3 py-2">
                <span aria-hidden className="w-5 shrink-0 text-center text-base">
                  {item.emoji ?? "•"}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink-900">{item.name}</span>
                <span className="shrink-0 text-sm font-medium tabular-nums text-ink-900">
                  {Number.isFinite(item.amount) ? formatCurrency(item.amount) : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}

        {status === "pending" ? (
          <div className="flex gap-2 border-t border-line-faint p-2">
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy || !canConfirm}
              className="focus-ring inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
            >
              <Check className="size-4" />
              Confirm &amp; add
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="focus-ring rounded-md border border-line px-3 py-2 text-sm font-medium hover:bg-canvas disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <p
            className={`border-t border-line-faint px-3 py-2 text-xs font-medium ${
              status === "added" ? "text-teal-700" : "text-ink-400"
            }`}
          >
            {status === "added" ? "✓ Added to your planner" : "Cancelled"}
          </p>
        )}
      </div>
    </div>
  );
}

function NumberField({
  value,
  placeholder,
  onChange,
  className
}: {
  value: number | null;
  placeholder: string;
  onChange: (value: number | null) => void;
  className?: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value === null || !Number.isFinite(value) ? "" : value}
      placeholder={placeholder}
      onChange={(event) => {
        const raw = event.target.value.trim();
        onChange(raw === "" ? null : Number(raw));
      }}
      className={`focus-ring rounded border border-line px-2 py-1 text-sm tabular-nums ${className ?? ""}`}
    />
  );
}
