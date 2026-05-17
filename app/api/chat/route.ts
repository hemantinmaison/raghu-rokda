import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardData } from "@/lib/queries";
import { plannerKindSchema } from "@/lib/validation";
import { buildSystemPrompt } from "@/lib/ai/context";
import { generateInsight, type ChatMessage } from "@/lib/ai/insight";
import { isAIConfigured } from "@/lib/ai/provider";

const bodySchema = z.object({
  tab: plannerKindSchema,
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000)
      })
    )
    .min(1)
    .max(30)
});

export async function POST(request: Request) {
  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "The assistant isn't configured yet. Add AI credentials to enable it." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = await fetchDashboardData(user.id);
  if (!result.ok) {
    return NextResponse.json({ error: "Could not load your planner data." }, { status: 500 });
  }

  try {
    const reply = await generateInsight({
      system: buildSystemPrompt(body.tab, result.data),
      messages: body.messages as ChatMessage[]
    });
    return NextResponse.json({ reply });
  } catch (error) {
    // Surface the provider's actual message so a bad model id / key is obvious.
    const detail = describeProviderError(error);
    console.error("[api/chat] generation failed:", detail, error);
    return NextResponse.json({ error: `Assistant error: ${detail}` }, { status: 502 });
  }
}

/** Pulls the real error message out of an LLM provider's HTTP error. */
function describeProviderError(error: unknown): string {
  const candidate = error as
    | { statusCode?: number; responseBody?: string; message?: string }
    | undefined;

  if (candidate?.responseBody) {
    try {
      const parsed = JSON.parse(candidate.responseBody) as {
        error?: { message?: string } | string;
        message?: string;
      };
      const message =
        (typeof parsed.error === "object" ? parsed.error?.message : parsed.error) ??
        parsed.message;
      if (typeof message === "string" && message.length > 0) {
        return candidate.statusCode ? `${candidate.statusCode} — ${message}` : message;
      }
    } catch {
      // responseBody was not JSON — fall through to the raw text.
    }
    return candidate.responseBody;
  }

  return error instanceof Error ? error.message : "Unknown error.";
}
