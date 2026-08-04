import "server-only";
import { getServerEnv } from "@/lib/config/env";
import type { ChatUsage } from "@/lib/chatbot/types";

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekChatOptions {
  messages: DeepSeekMessage[];
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

export interface DeepSeekJsonOptions {
  messages: DeepSeekMessage[];
  maxTokens?: number;
  temperature?: number;
  signal?: AbortSignal;
}

const BASE_URL = "https://api.deepseek.com/chat/completions";

function apiKey(): string {
  const key = getServerEnv().DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY is not configured");
  return key;
}

function encodeSSE(event: string, data: unknown): Uint8Array {
  return new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * Streams a DeepSeek chat completion and re-emits it as clean SSE events:
 *   event: delta  { content: string }
 *   event: done   { usage: { promptTokens, completionTokens } }
 *   event: error  { message: string }
 */
export async function streamDeepSeekChat(
  options: DeepSeekChatOptions,
): Promise<ReadableStream<Uint8Array>> {
  const env = getServerEnv();
  const controller = new AbortController();
  const externalSignal = options.signal;
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort(externalSignal.reason);
    else externalSignal.addEventListener("abort", () => controller.abort(externalSignal.reason), { once: true });
  }

  const timeout = setTimeout(() => controller.abort(new Error("DeepSeek request timed out")), 60_000);

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      model: env.CHATBOT_MODEL,
      messages: options.messages,
      max_tokens: options.maxTokens ?? env.CHATBOT_MAX_OUTPUT_TOKENS,
      temperature: options.temperature ?? env.CHATBOT_TEMPERATURE,
      stream: true,
      stream_options: { include_usage: true },
    }),
    signal: controller.signal,
    cache: "no-store",
  });

  if (!response.ok || !response.body) {
    clearTimeout(timeout);
    return new ReadableStream<Uint8Array>({
      start(streamController) {
        streamController.enqueue(encodeSSE("error", { message: "The assistant is temporarily unavailable. Please try again later." }));
        streamController.close();
      },
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(streamController) {
      let buffer = "";
      let usage: ChatUsage = { promptTokens: 0, completionTokens: 0 };
      let failed = false;

      try {
        while (true) {
          const { value, done: readerDone } = await reader.read();
          if (readerDone) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by blank lines.
          let sepIndex = buffer.indexOf("\n\n");
          while (sepIndex !== -1) {
            const rawEvent = buffer.slice(0, sepIndex);
            buffer = buffer.slice(sepIndex + 2);
            for (const line of rawEvent.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const payload = line.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const parsed = JSON.parse(payload) as {
                  choices?: Array<{ delta?: { content?: string }; finish_reason?: string | null }>;
                  usage?: { prompt_tokens?: number; completion_tokens?: number };
                };
                if (parsed.usage) {
                  usage = {
                    promptTokens: parsed.usage.prompt_tokens ?? 0,
                    completionTokens: parsed.usage.completion_tokens ?? 0,
                  };
                }
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  streamController.enqueue(encodeSSE("delta", { content }));
                }
              } catch {
                // Ignore malformed chunks.
              }
            }
            sepIndex = buffer.indexOf("\n\n");
          }
        }
      } catch (error) {
        failed = true;
        if (!controller.signal.aborted) {
          const message = error instanceof Error ? error.message : "Stream interrupted";
          streamController.enqueue(encodeSSE("error", { message }));
        }
      } finally {
        clearTimeout(timeout);
        if (!failed && !controller.signal.aborted) {
          streamController.enqueue(encodeSSE("done", { usage }));
        }
        controller.abort();
        streamController.close();
      }
    },
    cancel() {
      clearTimeout(timeout);
      controller.abort();
    },
  });
}

/**
 * Non-streaming JSON-mode completion (used by the guard model). Returns
 * null when the call fails so callers can fail closed.
 */
export async function deepSeekJson(
  options: DeepSeekJsonOptions,
): Promise<{ content: string; usage: ChatUsage } | null> {
  const env = getServerEnv();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error("DeepSeek request timed out")), 15_000);

  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey()}`,
      },
      body: JSON.stringify({
        model: env.CHATBOT_MODEL,
        messages: options.messages,
        max_tokens: options.maxTokens ?? 64,
        temperature: options.temperature ?? 0,
        response_format: { type: "json_object" },
        stream: false,
      }),
      signal: options.signal ?? controller.signal,
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return {
      content,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
      },
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
