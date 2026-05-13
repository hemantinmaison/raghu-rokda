import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseOrThrow } from "@/lib/zod";

describe("parseOrThrow", () => {
  it("returns parsed data on success", () => {
    const schema = z.object({ name: z.string().min(1) });
    expect(parseOrThrow(schema, { name: "ok" })).toEqual({ name: "ok" });
  });

  it("converts ZodError into a human Error with field paths", () => {
    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      amount: z.number().positive("Amount must be positive")
    });
    expect(() => parseOrThrow(schema, { name: "", amount: -1 })).toThrow(
      /name: Name is required.*amount: Amount must be positive/
    );
  });

  it("rethrows non-Zod errors unchanged", () => {
    const schema = {
      parse: () => {
        throw new TypeError("boom");
      }
    } as unknown as z.ZodSchema<unknown>;
    expect(() => parseOrThrow(schema, {})).toThrow(TypeError);
  });
});
