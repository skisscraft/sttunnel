import { query } from "./db";
import { embedQuery, embeddingsAvailable, toVectorLiteral } from "./embeddings";
import { isSourceName } from "./sources";

export type SearchMode = "hybrid" | "keyword" | "semantic";

export interface SearchHit {
  id: number;
  source: string;
  source_file: string;
  page: number;
  chunk_index: number;
  content: string;
  snippet: string;
  score: number;
  fts_rank: number | null;
  semantic_rank: number | null;
}

export interface SearchOptions {
  sources?: string[];
  limit?: number;
  mode?: SearchMode;
}

export interface SearchResult {
  hits: SearchHit[];
  mode: SearchMode; // the mode actually used (semantic may degrade to keyword)
}

export function normaliseSources(input: string[] | undefined) {
  const list = (input ?? []).map((s) => s.trim()).filter(isSourceName);
  return list.length ? list : null;
}

/**
 * Hybrid search over training_chunks: Postgres full-text + pgvector cosine, fused with RRF.
 * Falls back to keyword-only when no embedding key is configured.
 */
export async function searchChunks(q: string, opts: SearchOptions = {}): Promise<SearchResult> {
  const text = q.trim();
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 50);
  const sources = normaliseSources(opts.sources);
  let mode: SearchMode = opts.mode ?? "hybrid";
  if (!text) return { hits: [], mode };

  let vector: string | null = null;
  if (mode !== "keyword") {
    if (embeddingsAvailable()) {
      try {
        vector = toVectorLiteral(await embedQuery(text));
      } catch (err) {
        console.error("query embedding failed, using keyword search:", err);
      }
    }
    if (!vector) mode = "keyword";
  }

  const ftsWeight = mode === "semantic" ? 0 : 1;
  const semWeight = mode === "keyword" ? 0 : 1;
  const rows = await query<SearchHit>(
    `select * from hybrid_search($1, $2::vector, $3, $4, $5, $6)`,
    [text, vector, limit, sources, ftsWeight, semWeight],
  );
  return { hits: rows.map((r) => ({ ...r, id: Number(r.id), score: Number(r.score) })), mode };
}

export interface PageRow {
  id: number;
  source: string;
  source_file: string;
  page: number;
  text: string;
  char_count: number;
  low_text: boolean;
}

export async function getPage(source_file: string, page: number): Promise<PageRow | null> {
  const rows = await query<PageRow>(
    "select id, source, source_file, page, text, char_count, low_text from training_pages where source_file = $1 and page = $2",
    [source_file, page],
  );
  return rows[0] ?? null;
}

export async function corpusStats() {
  const rows = await query<{ source: string; pages: string; low_text: string; embedded: string }>(
    `select p.source, count(distinct p.id) as pages, count(distinct p.id) filter (where p.low_text) as low_text,
            count(distinct c.id) filter (where c.embedding is not null) as embedded
     from training_pages p left join training_chunks c on c.page_id = p.id
     group by p.source order by p.source`,
  );
  return rows.map((r) => ({ source: r.source, pages: Number(r.pages), low_text: Number(r.low_text), embedded: Number(r.embedded) }));
}
