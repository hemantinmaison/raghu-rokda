import { ZodError, type ZodTypeAny, type z } from "zod";

export function parseOrThrow<S extends ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues
        .map((issue) => {
          const path = issue.path.join(".");
          return path ? `${path}: ${issue.message}` : issue.message;
        })
        .join("; ");
      throw new Error(message);
    }
    throw error;
  }
}
