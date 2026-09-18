/**
 * Embeddings via Google's gemini-embedding-001 (Matryoshka model; we take 768 dims and
 * L2-normalise as Google recommends for truncated outputs). Chosen because it is the only
 * embedding provider with a working key on the build machine; swapping providers only
 * requires changing this file and the `vector(768)` column width.
 */
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMS = 768;

type TaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

function apiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

export function embeddingsAvailable() {
  return Boolean(apiKey());
}

function normalise(v: number[]): number[] {
  let sum = 0;
  for (const x of v) sum += x * x;
  const norm = Math.sqrt(sum) || 1;
  return v.map((x) => x / norm);
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 5): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const retryable = /\b(429|500|502|503|504)\b|fetch failed|ECONNRESET|ETIMEDOUT/i.test(msg);
      if (!retryable || i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
    }
  }
  throw lastErr;
}

/** Embed up to 100 texts in one request. Returns 768-dim normalised vectors. */
export async function embedTexts(texts: string[], taskType: TaskType): Promise<number[][]> {
  if (texts.length === 0) return [];
  if (texts.length > 100) throw new Error("embedTexts: max 100 texts per batch");
  const key = apiKey();
  if (!key) throw new Error("GEMINI_API_KEY is not set (needed for embeddings)");

  return withRetry(async () => {
    const res = await fetch(`${ENDPOINT}/${EMBEDDING_MODEL}:batchEmbedContents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        requests: texts.map((text) => ({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text }] },
          taskType,
          outputDimensionality: EMBEDDING_DIMS,
        })),
      }),
    });
    if (!res.ok) {
      throw new Error(`Gemini embeddings HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    const data = (await res.json()) as { embeddings: { values: number[] }[] };
    if (!data.embeddings || data.embeddings.length !== texts.length) {
      throw new Error("Gemini embeddings: unexpected response shape");
    }
    return data.embeddings.map((e) => normalise(e.values));
  });
}

export async function embedQuery(text: string): Promise<number[]> {
  const [v] = await embedTexts([text], "RETRIEVAL_QUERY");
  return v;
}

/** pgvector literal, e.g. "[0.1,0.2,...]" */
export function toVectorLiteral(v: number[]) {
  return `[${v.map((x) => x.toFixed(7)).join(",")}]`;
}
