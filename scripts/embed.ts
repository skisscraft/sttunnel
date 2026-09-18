/**
 * Generates embeddings for every chunk that does not have one yet.
 *  - Low-text pages (OCR noise) are skipped on purpose; they stay full-text searchable.
 *  - Vectors are cached in data/tbm_training_embeddings.jsonl keyed by (source_file, page,
 *    chunk_index, content hash) so a fresh database can be filled without calling the
 *    embedding API again (`npm run embed` reads the cache first).
 *   npm run embed            # use cache, call API for anything missing
 *   npm run embed -- --force # re-embed everything
 */
import "./env";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getPool } from "../src/lib/db";
import { embedTexts, embeddingsAvailable, toVectorLiteral, EMBEDDING_MODEL, EMBEDDING_DIMS } from "../src/lib/embeddings";
import { embeddingInput } from "../src/lib/chunking";

const CACHE_FILE = path.join(process.cwd(), "data", "tbm_training_embeddings.jsonl");
const BATCH = 50;

type Row = { id: number; source: string; source_file: string; page: number; chunk_index: number; content: string };
type CacheEntry = { key: string; model: string; dims: number; embedding: number[] };

function cacheKey(r: Row) {
  const hash = crypto.createHash("sha1").update(r.content).digest("hex").slice(0, 16);
  return `${r.source_file}:${r.page}:${r.chunk_index}:${hash}`;
}

function loadCache(): Map<string, CacheEntry> {
  const map = new Map<string, CacheEntry>();
  if (!fs.existsSync(CACHE_FILE)) return map;
  for (const line of fs.readFileSync(CACHE_FILE, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const e = JSON.parse(line) as CacheEntry;
    if (e.model === EMBEDDING_MODEL && e.dims === EMBEDDING_DIMS) map.set(e.key, e);
  }
  return map;
}

async function main() {
  const force = process.argv.includes("--force");
  const pool = getPool();
  const rows = (
    await pool.query<Row>(
      `select c.id, c.source, c.source_file, c.page, c.chunk_index, c.content
       from training_chunks c join training_pages p on p.id = c.page_id
       where p.low_text = false ${force ? "" : "and c.embedding is null"}
       order by c.source_file, c.page, c.chunk_index`,
    )
  ).rows;
  console.log(`${rows.length} chunks need embeddings`);
  if (rows.length === 0) {
    await pool.end();
    return;
  }

  const cache = loadCache();
  const fromCache: { row: Row; vec: number[] }[] = [];
  const toEmbed: Row[] = [];
  for (const r of rows) {
    const hit = force ? undefined : cache.get(cacheKey(r));
    if (hit) fromCache.push({ row: r, vec: hit.embedding });
    else toEmbed.push(r);
  }
  console.log(`${fromCache.length} from cache, ${toEmbed.length} to fetch from ${EMBEDDING_MODEL}`);
  if (toEmbed.length > 0 && !embeddingsAvailable()) {
    console.error("GEMINI_API_KEY is not set and the cache does not cover every chunk; aborting.");
    process.exit(2);
  }

  const cacheOut = fs.createWriteStream(CACHE_FILE, { flags: force ? "w" : "a" });
  async function store(row: Row, vec: number[], writeCache: boolean) {
    await pool.query("update training_chunks set embedding = $1::vector, embedding_model = $2 where id = $3", [
      toVectorLiteral(vec), EMBEDDING_MODEL, row.id,
    ]);
    if (writeCache) {
      const entry: CacheEntry = { key: cacheKey(row), model: EMBEDDING_MODEL, dims: EMBEDDING_DIMS, embedding: vec.map((x) => Number(x.toFixed(7))) };
      cacheOut.write(JSON.stringify(entry) + "\n");
    }
  }

  for (const { row, vec } of fromCache) await store(row, vec, false);

  let done = 0;
  for (let i = 0; i < toEmbed.length; i += BATCH) {
    const batch = toEmbed.slice(i, i + BATCH);
    const vectors = await embedTexts(batch.map((r) => embeddingInput(r.source, r.page, r.content)), "RETRIEVAL_DOCUMENT");
    for (let j = 0; j < batch.length; j++) await store(batch[j], vectors[j], true);
    done += batch.length;
    console.log(`embedded ${done}/${toEmbed.length}`);
  }
  await new Promise<void>((resolve) => cacheOut.end(resolve));

  const totals = await pool.query("select count(*) as chunks, count(embedding) as embedded from training_chunks");
  console.log(totals.rows[0]);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
