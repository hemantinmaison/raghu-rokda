const TAG_PALETTES = [
  { bg: "#eee0da", text: "#4f3422" }, // brown
  { bg: "#d3e5ef", text: "#183347" }, // blue
  { bg: "#dbeddb", text: "#1c3829" }, // green
  { bg: "#fdecc8", text: "#4a3919" }, // yellow
  { bg: "#fadec9", text: "#5c3b23" }, // orange
  { bg: "#ffe2dd", text: "#5d1715" }, // red
  { bg: "#f5e0e9", text: "#4c2337" }, // pink
  { bg: "#e8deee", text: "#3c2e44" }, // purple
  { bg: "#e3e2e0", text: "#32302c" } // gray
];

export function pickTagColor(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return TAG_PALETTES[Math.abs(hash) % TAG_PALETTES.length];
}

export function CategoryTag({ value }: { value: string }) {
  const { bg, text } = pickTagColor(value.toLowerCase().trim());
  return (
    <span
      className="inline-flex max-w-full truncate rounded px-2 py-0.5 text-[13px]"
      style={{ backgroundColor: bg, color: text }}
    >
      {value}
    </span>
  );
}
