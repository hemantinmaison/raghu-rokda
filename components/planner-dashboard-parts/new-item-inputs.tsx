import { EmojiPickerButton } from "./emoji-picker-button";

const inputClass =
  "focus-ring h-11 w-full min-w-0 border-0 bg-transparent px-3 py-2 text-sm text-ink-900 placeholder:text-ink-100 hover:bg-row-hover focus:bg-white";

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
  return (
    <input
      form={formId}
      className={inputClass}
      name={name}
      size={1}
      placeholder={placeholder}
      required={required}
    />
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
