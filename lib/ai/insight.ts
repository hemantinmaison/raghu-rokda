import { generateText } from "ai";
import { getLanguageModel } from "./provider";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/** Single-shot insight generation over the supplied conversation. */
export async function generateInsight(params: {
  system: string;
  messages: ChatMessage[];
}): Promise<string> {
  const { text } = await generateText({
    model: getLanguageModel(),
    system: params.system,
    messages: params.messages,
    temperature: 0.2,
    maxOutputTokens: 700
  });
  return text.trim();
}
