import Anthropic from "@anthropic-ai/sdk";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type Provider = "anthropic" | "gemini";

export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";
export const GEMINI_CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash";

/**
 * Provider selection. Claude is the default (per the build brief). If no Anthropic key is
 * configured the app falls back to Gemini so the Ask page still works; CHAT_PROVIDER pins one.
 */
export function resolveProvider(): Provider | null {
  const pref = (process.env.CHAT_PROVIDER || "auto").toLowerCase();
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  if (pref === "anthropic") return hasAnthropic ? "anthropic" : null;
  if (pref === "gemini") return hasGemini ? "gemini" : null;
  if (hasAnthropic) return "anthropic";
  if (hasGemini) return "gemini";
  return null;
}

export function providerLabel(p: Provider) {
  return p === "anthropic" ? ANTHROPIC_MODEL : GEMINI_CHAT_MODEL;
}

/** Streams answer text deltas. `history` excludes the final user turn, which is passed separately. */
export async function* streamAnswer(
  provider: Provider,
  system: string,
  history: ChatTurn[],
  userMessage: string,
): AsyncGenerator<string> {
  if (provider === "anthropic") yield* streamAnthropic(system, history, userMessage);
  else yield* streamGemini(system, history, userMessage);
}

async function* streamAnthropic(system: string, history: ChatTurn[], userMessage: string) {
  const client = new Anthropic();
  const effort = (process.env.ANTHROPIC_EFFORT || "medium") as "low" | "medium" | "high";
  const messages: Anthropic.MessageParam[] = [
    ...history.map((t) => ({ role: t.role, content: t.content }) satisfies Anthropic.MessageParam),
    { role: "user", content: userMessage },
  ];
  const stream = client.messages.stream({
    model: ANTHROPIC_MODEL,
    max_tokens: 4096,
    // Stable prefix → cached across requests; the retrieved excerpts live in the user turn.
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    thinking: { type: "adaptive" },
    output_config: { effort },
    messages,
  });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") {
    yield "\n\n_The model declined to answer this request._";
  } else if (final.stop_reason === "max_tokens") {
    yield "\n\n_(answer truncated)_";
  }
}

async function* streamGemini(system: string, history: ChatTurn[], userMessage: string) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CHAT_MODEL}:streamGenerateContent?alt=sse`;
  const contents = [
    ...history.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
    { role: "user", parts: [{ text: userMessage }] },
  ];
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key ?? "" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`Gemini chat HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
        const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
        if (text) yield text;
      } catch {
        // ignore partial JSON lines
      }
    }
  }
}
