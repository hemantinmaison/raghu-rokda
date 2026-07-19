const TAG_PALETTES: Record<string, { bg: string; text: string }> = {
  brown: { bg: "#eee0da", text: "#4f3422" },
  blue: { bg: "#d3e5ef", text: "#183347" },
  green: { bg: "#dbeddb", text: "#1c3829" },
  yellow: { bg: "#fdecc8", text: "#4a3919" },
  orange: { bg: "#fadec9", text: "#5c3b23" },
  red: { bg: "#ffe2dd", text: "#5d1715" },
  pink: { bg: "#f5e0e9", text: "#4c2337" },
  purple: { bg: "#e8deee", text: "#3c2e44" },
  gray: { bg: "#e3e2e0", text: "#32302c" }
};

export function pickTagColor(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  const palettes = Object.values(TAG_PALETTES);
  return palettes[Math.abs(hash) % palettes.length];
}

export function CategoryTag({
  value,
  emoji,
  color
}: {
  value: string;
  emoji?: string | null;
  color?: string;
}) {
  const { bg, text } = color && TAG_PALETTES[color]
    ? TAG_PALETTES[color]
    : pickTagColor(value.toLowerCase().trim());
  return (
    <span
      className="inline-flex max-w-full truncate rounded px-2 py-0.5 text-[13px]"
      style={{ backgroundColor: bg, color: text }}
    >
      {emoji ? <span className="mr-1">{emoji}</span> : null}
      {value}
    </span>
  );
}
