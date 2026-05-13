import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/redirects";

describe("safeRedirectPath", () => {
  it("returns the fallback for null / undefined / empty values", () => {
    expect(safeRedirectPath(null)).toBe("/");
    expect(safeRedirectPath(undefined)).toBe("/");
    expect(safeRedirectPath("")).toBe("/");
  });

  it("accepts same-origin absolute paths", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(safeRedirectPath("/items/123")).toBe("/items/123");
    expect(safeRedirectPath("/a?b=c#d")).toBe("/a?b=c#d");
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/");
    expect(safeRedirectPath("//evil.com/path")).toBe("/");
  });

  it("rejects backslash-prefixed paths", () => {
    expect(safeRedirectPath("/\\evil.com")).toBe("/");
  });

  it("rejects absolute URLs", () => {
    expect(safeRedirectPath("http://evil.com")).toBe("/");
    expect(safeRedirectPath("https://evil.com/x")).toBe("/");
    expect(safeRedirectPath("javascript:alert(1)")).toBe("/");
  });

  it("rejects paths that don't start with /", () => {
    expect(safeRedirectPath("dashboard")).toBe("/");
    expect(safeRedirectPath("../etc/passwd")).toBe("/");
  });

  it("honors a custom fallback", () => {
    expect(safeRedirectPath(null, "/login")).toBe("/login");
    expect(safeRedirectPath("//bad", "/login")).toBe("/login");
  });
});
