"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Smile } from "lucide-react";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const PICKER_WIDTH = 320;
const PICKER_HEIGHT = 380;
const GAP = 6;

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
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    function place() {
      const rect = buttonRef.current!.getBoundingClientRect();
      const top = Math.max(8, rect.top - PICKER_HEIGHT - GAP);
      const maxLeft = window.innerWidth - PICKER_WIDTH - 8;
      const left = Math.min(Math.max(8, rect.left), maxLeft);
      setPosition({ top, left });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setIsOpen(false);
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
    <>
      <input type="hidden" form={formId} name={name} value={emoji ?? ""} />
      <button
        ref={buttonRef}
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
      {isOpen && position && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={popoverRef}
              style={{ position: "fixed", top: position.top, left: position.left, zIndex: 1000 }}
              className="overflow-hidden rounded-lg border border-line bg-white shadow-lg"
            >
              <EmojiPicker
                width={PICKER_WIDTH}
                height={PICKER_HEIGHT}
                onEmojiClick={(data) => {
                  setEmoji(data.emoji);
                  setIsOpen(false);
                }}
                previewConfig={{ showPreview: false }}
                skinTonesDisabled
                searchPlaceholder="Search emoji"
                lazyLoadEmojis
              />
            </div>,
            document.body
          )
        : null}
    </>
  );
}
