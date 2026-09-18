/**
 * Loads data/tbm_training_digitized.jsonl into training_pages and builds training_chunks.
 * Idempotent: re-running upserts pages and rebuilds chunks whose content changed
 * (existing embeddings are kept when the chunk content is unchanged).
 *   npm run ingest
 */
import "./env";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { getPool } from "../src/lib/db";
import { chunkPage, isLowText, nonWhitespaceLength } from "../src/lib/chunking";
import { SOURCES, TOTAL_PAGES } from "../src/lib/sources";

type Record_ = { source: string; source_file: string; page: number; text: string };

async function readJsonl(file: string): Promise<Record_[]> {
  const out: Record_[] = [];
  const rl = readline.createInterface({ input: fs.createReadStream(file, "utf8"), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const rec = JSON.parse(line) as Record_;
    if (typeof rec.source !== "string" || typeof rec.source_file !== "string" || typeof rec.page !== "number" || typeof rec.text !== "string") {
      throw new Error(`Bad record: ${line.slice(0, 120)}`);
    }
    out.push(rec);
  }
  return out;
}

async function main() {
  const file = process.argv[2] ?? path.join(process.cwd(), "data", "tbm_training_digitized.jsonl");
  const records = await readJsonl(file);
  console.log(`read ${records.length} page records from ${path.relative(process.cwd(), file)}`);
  if (records.length !== TOTAL_PAGES) {
    console.warn(`warning: expected ${TOTAL_PAGES} records (per manifest), got ${records.length}`);
  }
  for (const s of SOURCES) {
    const n = records.filter((r) => r.source === s.name).length;
    if (n !== s.pages) console.warn(`warning: ${s.name}: expected ${s.pages} pages, got ${n}`);
  }

  const pool = getPool();
  const client = await pool.connect();
  let pagesUpserted = 0, chunksInserted = 0, chunksUpdated = 0, chunksUnchanged = 0, chunksDeleted = 0, lowText = 0;
  try {
    await client.query("begin");
    for (const rec of records) {
      const low = isLowText(rec.text);
      if (low) lowText++;
      const page = await client.query<{ id: number }>(
        `insert into training_pages (source, source_file, page, text, char_count, low_text)
         values ($1, $2, $3, $4, $5, $6)
         on conflict (source_file, page) do update
           set source = excluded.source, text = excluded.text,
               char_count = excluded.char_count, low_text = excluded.low_text
         returning id`,
        [rec.source, rec.source_file, rec.page, rec.text, nonWhitespaceLength(rec.text), low],
      );
      pagesUpserted++;
      const pageId = page.rows[0].id;
      const chunks = chunkPage(rec.text);
      for (let i = 0; i < chunks.length; i++) {
        const res = await client.query<{ inserted: boolean; changed: boolean }>(
          `insert into training_chunks (page_id, source, source_file, page, chunk_index, content)
           values ($1, $2, $3, $4, $5, $6)
           on conflict (source_file, page, chunk_index) do update
             set page_id = excluded.page_id, source = excluded.source,
                 content = excluded.content,
                 -- drop stale vectors when the text changed
                 embedding = case when training_chunks.content = excluded.content then training_chunks.embedding else null end,
                 embedding_model = case when training_chunks.content = excluded.content then training_chunks.embedding_model else null end
           returning (xmax = 0) as inserted, (content is distinct from $6) as changed`,
          [pageId, rec.source, rec.source_file, rec.page, i, chunks[i]],
        );
        if (res.rows[0].inserted) chunksInserted++;
        else if (res.rows[0].changed) chunksUpdated++;
        else chunksUnchanged++;
      }
      const del = await client.query(
        "delete from training_chunks where source_file = $1 and page = $2 and chunk_index >= $3",
        [rec.source_file, rec.page, chunks.length],
      );
      chunksDeleted += del.rowCount ?? 0;
    }
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }

  const totals = await pool.query(
    "select (select count(*) from training_pages) as pages, (select count(*) from training_chunks) as chunks, (select count(*) from training_chunks where embedding is not null) as embedded",
  );
  console.log({ pagesUpserted, lowText, chunksInserted, chunksUpdated, chunksUnchanged, chunksDeleted, ...totals.rows[0] });
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
