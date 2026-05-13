// Validates a redirect target sent via query string. Must be a same-origin
// absolute path: starts with "/" but not "//" or "/\", and does not parse to
// an absolute URL with a host.
export function safeRedirectPath(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  try {
    const parsed = new URL(next, "http://placeholder.invalid");
    if (parsed.origin !== "http://placeholder.invalid") return fallback;
  } catch {
    return fallback;
  }
  return next;
}
