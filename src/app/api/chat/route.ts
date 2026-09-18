import { resolveProvider, providerLabel, streamAnswer, type ChatTurn } from "@/lib/llm";
import { retrieveForQuestion, buildUserMessage, SYSTEM_PROMPT } from "@/lib/rag";
import { normaliseSources } from "@/lib/search";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = { messages?: ChatTurn[]; sources?: string[] };

/**
 * POST /api/chat  { messages: [{role, content}...], sources?: string[] }
 * Responds with newline-delimited JSON events:
 *   {"type":"sources","citations":[...],"provider":"...","model":"..."}
 *   {"type":"delta","text":"..."}      (repeated)
 *   {"type":"done"} | {"type":"error","message":"..."}
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const turns = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }));
  const last = turns[turns.length - 1];
  if (!last || last.role !== "user" || !last.content.trim()) {
    return Response.json({ error: "The last message must be a user question." }, { status: 400 });
  }
  const provider = resolveProvider();
  if (!provider) {
    return Response.json(
      { error: "No chat model configured. Set ANTHROPIC_API_KEY (or GEMINI_API_KEY as a fallback)." },
      { status: 503 },
    );
  }

  const question = last.content.trim();
  const history = turns.slice(Math.max(0, turns.length - 7), turns.length - 1); // keep the last few turns
  const sources = normaliseSources(body.sources) ?? undefined;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        const { context, citations, mode } = await retrieveForQuestion(question, sources);
        send({ type: "sources", citations, provider, model: providerLabel(provider), retrieval: mode });
        const userMessage = buildUserMessage(question, context);
        for await (const delta of streamAnswer(provider, SYSTEM_PROMPT, history, userMessage)) {
          send({ type: "delta", text: delta });
        }
        send({ type: "done" });
      } catch (err) {
        console.error("chat failed", err);
        send({ type: "error", message: "The assistant is unavailable right now. Please try again." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
