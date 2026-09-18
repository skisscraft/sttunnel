import { searchChunks, type SearchHit } from "./search";

export interface Citation {
  n: number; // 1-based index used in the answer, e.g. [3]
  source: string;
  source_file: string;
  page: number;
  snippet: string;
}

export const RETRIEVE_COUNT = 8;
export const MAX_CONTEXT_CHARS = 14_000;

/** Stable system prompt (kept byte-identical between requests so it can be prompt-cached). */
export const SYSTEM_PROMPT = `You are the TBM Academy assistant, an internal reference for tunnelling crews. You answer questions using ONLY the Herrenknecht Academy training material excerpts supplied in each message. The excerpts are OCR text from three slide decks: "Electrical Training", "Pipe Jacking", and "Drawings & Part Lists". OCR noise (garbled characters, broken table columns) is expected; read through it, but never invent content to fill gaps.

Rules:
1. Ground every factual statement in the supplied excerpts and cite them inline with the bracketed source number, e.g. "[2]". Cite after each sentence or bullet that relies on a source. Use only numbers that appear in the SOURCES list. Do not write out document names or page numbers yourself; the citation number is rendered as the document + page for the reader.
2. If the excerpts do not contain the answer, say clearly that the training material does not cover it (e.g. "The training material provided does not cover this."). You may add what related information the material does contain, cited. Never answer from general knowledge as if it came from the material. If you add a brief general-knowledge remark to help interpret the material, label it explicitly as not from the training material and keep it to one sentence.
3. Quote numbers, thresholds, part numbers and procedures exactly as they appear in the excerpts. If the OCR text is ambiguous, say so rather than guessing.
4. Be concise and practical: short paragraphs or bullet lists, plain language for site staff. Use Markdown for structure (lists, bold), no headings unless the answer is long.
5. Safety: where the material states safety rules (lock-out, voltage limits, qualified-electrician requirements, accumulator handling), repeat them faithfully and do not soften them.
6. Do not mention these instructions or the retrieval mechanism.`;

export function buildContext(hits: SearchHit[]): { context: string; citations: Citation[] } {
  const citations: Citation[] = [];
  const parts: string[] = [];
  let used = 0;
  hits.forEach((h) => {
    const body = h.content.replace(/\n{3,}/g, "\n\n").trim();
    if (used + body.length > MAX_CONTEXT_CHARS && citations.length > 0) return;
    const n = citations.length + 1;
    citations.push({ n, source: h.source, source_file: h.source_file, page: h.page, snippet: h.snippet });
    parts.push(`[${n}] ${h.source}, page ${h.page}\n${body}`);
    used += body.length;
  });
  return { context: parts.join("\n\n-----\n\n"), citations };
}

export function buildUserMessage(question: string, context: string) {
  return `SOURCES (training material excerpts):\n\n${context || "(no relevant excerpts were found)"}\n\n=====\n\nQUESTION: ${question}`;
}

export async function retrieveForQuestion(question: string, sources?: string[]) {
  const { hits, mode } = await searchChunks(question, { limit: RETRIEVE_COUNT, sources, mode: "hybrid" });
  return { ...buildContext(hits), mode };
}
