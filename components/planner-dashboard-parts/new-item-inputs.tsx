"use client";

import { useEffect, useRef, useState } from "react";
import { EmojiPickerButton } from "./emoji-picker-button";

const inputClass =
  "focus-ring h-11 w-full min-w-0 border-0 bg-transparent px-3 py-2 text-sm text-ink-900 placeholder:text-ink-100 hover:bg-row-hover focus:bg-white";
const textareaClass =
  "focus-ring absolute left-0 top-0 z-20 h-11 w-full min-w-0 resize-y border-0 bg-white px-3 py-2 text-sm leading-relaxed text-ink-900 shadow-sm placeholder:text-ink-100 hover:bg-row-hover focus:h-20";
const multilineTextLength = 48;

function usesMultilineEditor(value: string) {
  return value.includes("\n") || value.trim().length > multilineTextLength;
}

export function NewNameInput({
  formId,
  placeholder
}: {
  formId: string;
  placeholder: string;
}) {
  return (
    <div className="flex h-11 items-center gap-1 pl-2 pr-1 hover:bg-row-hover">
      <EmojiPickerButton formId={formId} name="emoji" />
      <input
        form={formId}
        className="focus-ring h-full w-full min-w-0 border-0 bg-transparent px-2 py-2 text-sm text-ink-900 placeholder:text-ink-100 focus:bg-white"
        name="name"
        size={1}
        placeholder={placeholder}
        required
      />
    </div>
  );
}

export function NewTextInput({
  formId,
  name,
  placeholder,
  required = false
}: {
  formId: string;
  name: string;
  placeholder: string;
  required?: boolean;
}) {
  const [value, setValue] = useState("");
  const hasMountedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMultiline = usesMultilineEditor(value);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (isMultiline) {
      textareaRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  }, [isMultiline]);

  return (
    <div className="relative h-11 min-w-0">
      {isMultiline ? (
        <textarea
          ref={textareaRef}
          form={formId}
          className={textareaClass}
          name={name}
          value={value}
          rows={3}
          placeholder={placeholder}
          required={required}
          onChange={(event) => setValue(event.target.value)}
        />
      ) : (
        <input
          ref={inputRef}
          form={formId}
          className={inputClass}
          name={name}
          value={value}
          size={1}
          placeholder={placeholder}
          required={required}
          onChange={(event) => setValue(event.target.value)}
        />
      )}
    </div>
  );
}

export function NewNumberInput({
  formId,
  name,
  placeholder,
  required = false,
  step = "1",
  align = "left"
}: {
  formId: string;
  name: string;
  placeholder: string;
  required?: boolean;
  step?: string;
  align?: "left" | "right";
}) {
  return (
    <input
      form={formId}
      className={`${inputClass} tabular-nums ${align === "right" ? "text-right" : ""}`}
      name={name}
      type="number"
      size={1}
      min={required ? "1" : "0"}
      step={step}
      placeholder={placeholder}
      required={required}
    />
  );
}
