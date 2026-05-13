import { BUDGET_CATEGORY_SUGGESTIONS } from "@/lib/validation";

const inputClass =
  "focus-ring h-14 w-full min-w-0 border-0 bg-transparent px-4 py-3 text-ink-700 placeholder:text-ink-100 hover:bg-row-hover focus:bg-white";

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
      placeholder={placeholder}
      required={required}
    />
  );
}

export function NewCategoryInput({ formId }: { formId: string }) {
  return (
    <>
      <input
        form={formId}
        className={inputClass}
        name="category"
        list="budget-categories"
        placeholder="Category"
        required
      />
      <datalist id="budget-categories">
        {BUDGET_CATEGORY_SUGGESTIONS.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
    </>
  );
}

export function NewNumberInput({
  formId,
  name,
  placeholder,
  required = false,
  step = "1"
}: {
  formId: string;
  name: string;
  placeholder: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <input
      form={formId}
      className={`${inputClass} tabular-nums`}
      name={name}
      type="number"
      min={required ? "1" : "0"}
      step={step}
      placeholder={placeholder}
      required={required}
    />
  );
}
