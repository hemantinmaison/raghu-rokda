"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

type EmojiPickerButtonProps = {
  formId?: string;
  name: string;
  defaultValue?: string | null;
  ariaLabel?: string;
};

export function EmojiPickerButton({
  formId,
  name,
  defaultValue = null,
  ariaLabel = "Pick an emoji"
}: EmojiPickerButtonProps) {
  const [emoji, setEmoji] = useState<string | null>(defaultValue ?? null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef} className="relative inline-flex">
      <input type="hidden" form={formId} name={name} value={emoji ?? ""} />
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setIsOpen((value) => !value)}
        className="focus-ring inline-flex size-8 items-center justify-center rounded-md text-xl hover:bg-canvas"
      >
        {emoji ? (
          <span aria-hidden>{emoji}</span>
        ) : (
          <Smile className="size-4 text-ink-300" aria-hidden />
        )}
      </button>
      {isOpen ? (
        <div className="absolute bottom-full left-0 z-50 mb-1 overflow-hidden rounded-lg border border-line bg-white shadow-lg">
          <EmojiPicker
            width={320}
            height={380}
            onEmojiClick={(data) => {
              setEmoji(data.emoji);
              setIsOpen(false);
            }}
            previewConfig={{ showPreview: false }}
            skinTonesDisabled
            searchPlaceholder="Search emoji"
            lazyLoadEmojis
          />
        </div>
      ) : null}
    </div>
  );
}
