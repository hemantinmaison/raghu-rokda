const categories = [
  "Rent",
  "Groceries",
  "Transport",
  "Utilities",
  "Insurance",
  "Healthcare",
  "Education",
  "Subscriptions",
  "Family",
  "Other"
];

const inputClass =
  "focus-ring h-14 w-full min-w-0 border-0 bg-transparent px-4 py-3 text-[#2f2f2f] placeholder:text-[#b8b3ad] hover:bg-[#fbfaf8] focus:bg-white";

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
        {categories.map((category) => (
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
