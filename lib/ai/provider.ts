import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Provider-agnostic LLM access. Any OpenAI-compatible provider works — the
 * provider, model, key and endpoint all come from environment variables, so
 * switching vendors never touches application code.
 *
 *   AI_PROVIDER  e.g. xai | openai | openrouter | groq | deepseek | together
 *   AI_MODEL     the model id for that provider
 *   AI_API_KEY   the provider API key
 *   AI_BASE_URL  optional override of the OpenAI-compatible endpoint
 */
const PROVIDER_BASE_URLS: Record<string, string> = {
  xai: "https://api.x.ai/v1",
  openai: "https://api.openai.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
  groq: "https://api.groq.com/openai/v1",
  deepseek: "https://api.deepseek.com/v1",
  together: "https://api.together.xyz/v1"
};

const DEFAULT_PROVIDER = "xai";
const DEFAULT_MODEL = "grok-4.3";

export function isAIConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY?.trim());
}

export function getLanguageModel() {
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("AI is not configured — set AI_API_KEY in your environment.");
  }

  const providerId = (process.env.AI_PROVIDER?.trim() || DEFAULT_PROVIDER).toLowerCase();
  const modelId = process.env.AI_MODEL?.trim() || DEFAULT_MODEL;
  const baseURL = process.env.AI_BASE_URL?.trim() || PROVIDER_BASE_URLS[providerId];

  if (!baseURL) {
    throw new Error(
      `Unknown AI_PROVIDER "${providerId}" — set AI_BASE_URL to its OpenAI-compatible endpoint.`
    );
  }

  const provider = createOpenAICompatible({ name: providerId, apiKey, baseURL });
  return provider(modelId);
}
