import { env } from "../config/env.js";
import { WorkspaceSettingsModel } from "../models/workspace-settings.js";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const FETCH_TIMEOUT_MS = 150_000; // 150 seconds — Minimax M2.5 is a reasoning model that needs ~80-120s

async function callOpenRouterRaw(
  messages: ChatMessage[],
  responseFormat?: { type: "json_object" } | null
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  // Load workspace settings from MongoDB to use dynamic keys/models if configured
  let apiKey = env.OPENROUTER_API_KEY;
  let modelName = env.OPENROUTER_MODEL;

  try {
    const settings = await WorkspaceSettingsModel.findOne({ singletonKey: "workspace" }).lean();
    if (settings) {
      if (settings.openRouterApiKey && settings.openRouterApiKey.trim().length > 6) {
        apiKey = settings.openRouterApiKey.trim();
      }
      if (settings.defaultModel) {
        modelName = settings.defaultModel;
      }
    }
  } catch (err) {
    console.error("Failed to load workspace settings for OpenRouter call, falling back to env defaults:", err);
  }

  const bodyPayload: Record<string, unknown> = {
    model: modelName,
    messages,
    temperature: 0.7,
    max_tokens: 4000,
  };

  if (responseFormat) {
    bodyPayload.response_format = responseFormat;
  }

  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error(`OpenRouter request timed out after ${FETCH_TIMEOUT_MS / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as OpenRouterResponse;

  if (!data.choices || data.choices.length === 0) {
    throw new Error("OpenRouter returned no choices");
  }

  const content = data.choices[0].message.content;

  if (!content) {
    throw new Error("OpenRouter returned empty content");
  }

  return content;
}

/** For exam paper generation — forces strict JSON response format. */
export async function callOpenRouter(messages: ChatMessage[]): Promise<string> {
  return callOpenRouterRaw(messages, { type: "json_object" });
}

/** For toolkit tools (lesson plans, rubrics, etc.) — returns rich markdown text. */
export async function callOpenRouterText(messages: ChatMessage[]): Promise<string> {
  return callOpenRouterRaw(messages, null);
}
