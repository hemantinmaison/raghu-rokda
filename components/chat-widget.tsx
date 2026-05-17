"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import type { PlannerKind } from "@/lib/types";

type Message = { role: "user" | "assistant"; content: string };

const TAB_LABEL: Record<PlannerKind, string> = {
  budget: "Monthly Budget",
  debt: "Debt Management",
  wishlist: "Wishlist"
};

const SUGGESTIONS: Record<PlannerKind, string[]> = {
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

export function ChatWidget({ activeTab }: { activeTab: PlannerKind }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (trimmed.length === 0 || isLoading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab: activeTab, messages: nextMessages })
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? "The assistant couldn't respond.");
      }
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="fixed bottom-5 right-5 z-40 flex h-[520px] max-h-[calc(100vh-2.5rem)] w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl sm:w-[370px]">
      <header className="flex items-start justify-between gap-2 border-b border-line-faint px-4 py-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
            <Sparkles className="size-4 text-teal-700" />
            Money assistant
          </p>
          <p className="mt-0.5 text-xs text-ink-400">
            Answering from your {TAB_LABEL[activeTab]} data
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
              Ask anything about your {TAB_LABEL[activeTab]} — I&apos;ll answer from your own data.
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS[activeTab].map((suggestion) => (
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
          messages.map((message, index) => (
            <div
              key={index}
              className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-ink-900 text-white"
                    : "bg-canvas text-ink-900"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}

        {isLoading ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2 text-sm text-ink-400">
              <Loader2 className="size-4 animate-spin" />
              Thinking…
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
            maxLength={2000}
            placeholder={`Ask about your ${TAB_LABEL[activeTab].toLowerCase()}…`}
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
