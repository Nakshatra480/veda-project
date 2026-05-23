import { GeneratedPaperResponseSchema, type GeneratedPaperResponse } from "@vedaai/shared";

export function parsePaperResponse(raw: string): GeneratedPaperResponse {
  let jsonString = raw.trim();

  const codeBlockMatch = jsonString.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    jsonString = codeBlockMatch[1].trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    const jsonStart = jsonString.indexOf("{");
    const jsonEnd = jsonString.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      try {
        parsed = JSON.parse(jsonString.substring(jsonStart, jsonEnd + 1));
      } catch {
        throw new Error(`Failed to parse LLM response as JSON: ${jsonString.substring(0, 200)}`);
      }
    } else {
      throw new Error(`No valid JSON found in LLM response: ${jsonString.substring(0, 200)}`);
    }
  }

  const result = GeneratedPaperResponseSchema.safeParse(parsed);

  if (!result.success) {
    const errorDetails = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    throw new Error(`LLM response validation failed: ${errorDetails}`);
  }

  return result.data;
}
