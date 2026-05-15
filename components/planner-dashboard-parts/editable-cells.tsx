"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { EmojiPickerButton } from "./emoji-picker-button";

const inputClass =
  "focus-ring w-full min-w-0 rounded border border-line bg-white px-1.5 py-1 text-sm text-ink-900";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Could not save.";
}

type NamePatch = { name?: string; emoji?: string | null };

export function EditableNameCell({
  name,
  emoji,
  onSave
}: {
  name: string;
  emoji: string | null;
  onSave: (patch: NamePatch) => Promise<void>;
}) {
  const [localName, setLocalName] = useState(name);
  const [localEmoji, setLocalEmoji] = useState(emoji);
  const [draft, setDraft] = useState(name);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setLocalName(name), [name]);
  useEffect(() => setLocalEmoji(emoji), [emoji]);
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function commitName() {
    setIsEditing(false);
    const trimmed = draft.trim();
    if (trimmed.length === 0 || trimmed === localName) {
      setDraft(localName);
      return;
    }
    const previous = localName;
    setError(null);
    setLocalName(trimmed);
    startTransition(() => {
      void onSave({ name: trimmed }).catch((saveError) => {
        setLocalName(previous);
        setDraft(previous);
        setError(errorMessage(saveError));
      });
    });
  }

  function handleEmoji(next: string | null) {
    const previous = localEmoji;
    setError(null);
    setLocalEmoji(next);
    startTransition(() => {
      void onSave({ emoji: next }).catch((saveError) => {
        setLocalEmoji(previous);
        setError(errorMessage(saveError));
      });
    });
  }

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <EmojiPickerButton value={localEmoji} onSelect={handleEmoji} />
      {isEditing ? (
        <input
          ref={inputRef}
          value={draft}
          size={1}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitName}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitName();
            } else if (event.key === "Escape") {
              setDraft(localName);
              setIsEditing(false);
            }
          }}
          className={inputClass}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(localName);
            setIsEditing(true);
          }}
          title={error ?? undefined}
          className="min-w-0 flex-1 truncate rounded px-1 py-1 text-left text-sm text-ink-900 hover:bg-row-hover"
        >
          {localName}
        </button>
      )}
    </div>
  );
}

export function EditableTextCell({
  value,
  placeholder = "Empty",
  onSave
}: {
  value: string | null;
  placeholder?: string;
  onSave: (value: string | null) => Promise<void>;
}) {
  const [local, setLocal] = useState(value);
  const [draft, setDraft] = useState(value ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setLocal(value), [value]);
  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  function commit() {
    setIsEditing(false);
    const next = draft.trim().length === 0 ? null : draft.trim();
    if (next === local) return;
    const previous = local;
    setError(null);
    setLocal(next);
    startTransition(() => {
      void onSave(next).catch((saveError) => {
        setLocal(previous);
        setDraft(previous ?? "");
        setError(errorMessage(saveError));
      });
    });
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        size={1}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          } else if (event.key === "Escape") {
            setDraft(local ?? "");
            setIsEditing(false);
          }
        }}
        className={inputClass}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(local ?? "");
        setIsEditing(true);
      }}
      title={error ?? undefined}
      className="w-full min-w-0 truncate rounded px-1 py-1 text-left text-sm hover:bg-row-hover"
    >
      {local ? (
        <span className="text-ink-500">{local}</span>
      ) : (
        <span className="text-ink-200">{placeholder}</span>
      )}
    </button>
  );
}

export function EditableNumberCell({
  value,
  onSave,
  format,
  required = false,
  align = "left",
  step = "1",
  placeholder = "—"
}: {
  value: number | null;
  onSave: (value: number | null) => Promise<void>;
  format: (value: number) => string;
  required?: boolean;
  align?: "left" | "right";
  step?: string;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value);
  const [draft, setDraft] = useState(value === null ? "" : String(value));
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setLocal(value), [value]);
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function commit() {
    const raw = draft.trim();
    let next: number | null;
    if (raw.length === 0) {
      if (required) {
        setError("A value is required");
        setDraft(local === null ? "" : String(local));
        setIsEditing(false);
        return;
      }
      next = null;
    } else {
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) {
        setError("Enter a valid number");
        setDraft(local === null ? "" : String(local));
        setIsEditing(false);
        return;
      }
      next = parsed;
    }
    setIsEditing(false);
    if (next === local) return;
    const previous = local;
    setError(null);
    setLocal(next);
    startTransition(() => {
      void onSave(next).catch((saveError) => {
        setLocal(previous);
        setDraft(previous === null ? "" : String(previous));
        setError(errorMessage(saveError));
      });
    });
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        type="number"
        size={1}
        step={step}
        min={required ? "1" : "0"}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          } else if (event.key === "Escape") {
            setDraft(local === null ? "" : String(local));
            setIsEditing(false);
          }
        }}
        className={`${inputClass} tabular-nums ${align === "right" ? "text-right" : ""}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(local === null ? "" : String(local));
        setIsEditing(true);
      }}
      title={error ?? undefined}
      className={`w-full min-w-0 truncate rounded px-1 py-1 text-sm tabular-nums hover:bg-row-hover ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {local === null ? (
        <span className="text-ink-200">{placeholder}</span>
      ) : (
        <span className="text-ink-900">{format(local)}</span>
      )}
    </button>
  );
}
