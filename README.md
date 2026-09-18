# TBM Academy

Internal, searchable reference for Herrenknecht Academy TBM training material, with a cited RAG assistant.
Built from the Phase 2 brief in `docs/PHASE_2_BUILD_BRIEF.md`. "TBM Academy" is a working title.

- **Manual** — full-text + semantic search across all 756 digitized pages, filterable by document, every hit links to the page it came from.
- **Ask** — chatbot grounded only in the ingested pages; every answer cites document + page and says so when the material does not cover a question.
- **Course / Troubleshoot** — navigation placeholders ("coming soon"), no functionality yet by design.

## Stack

Next.js 16 (App Router, TypeScript, Tailwind v4) · Postgres with pgvector (Supabase) · Claude API for chat (Gemini as fallback) · gemini-embedding-001 for embeddings · Vercel.

```
data/                     Phase 1 inputs (JSONL, manifest, per-document markdown) + cached embeddings
supabase/migrations/      schema: training_pages, training_chunks (pgvector + tsvector), hybrid_search()
scripts/                  db:migrate, ingest, embed (run with tsx, work against any Postgres URL)
src/lib/                  db pool, chunking, embeddings, search, rag (prompt + context), llm (providers)
src/app/api/              /search, /chat (streaming NDJSON), /page, /health
src/app/(pages)           /manual, /manual/[doc]/[page] (reader), /ask, /course, /troubleshoot
```

## Setup

1. **Database.** Create a Supabase project (or any Postgres 15+ with pgvector). Copy `.env.example` to `.env.local` and set
   `DATABASE_URL` to the **Transaction pooler** URI (port 6543) from *Project Settings → Database*.
2. **Keys.** `ANTHROPIC_API_KEY` for chat, `GEMINI_API_KEY` for embeddings (also used as chat fallback when no Anthropic key is set).
3. **Load the content.**
   ```bash
   npm install
   npm run db:setup      # = db:migrate + ingest + embed
   ```
   `embed` reads `data/tbm_training_embeddings.jsonl` first, so a fresh database is filled without calling the embedding API again.
   Only new/changed chunks are sent to Gemini.
4. **Run.** `npm run dev` → http://localhost:3000. Check `GET /api/health`.

## Deploy (Vercel)

1. Import this repository in Vercel (framework preset: Next.js, no extra build settings).
2. Add environment variables: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` (optional: `ANTHROPIC_MODEL`, `ANTHROPIC_EFFORT`, `CHAT_PROVIDER`).
3. Deploy. Visit `/api/health` on the deployment; it should report `pages: 756` and a chat provider.

No auth is configured (internal tool, per the brief). Add Vercel password protection or an auth layer before exposing it publicly.

## How retrieval works

- One chunk per page by default; pages over 1,800 characters are split at paragraph boundaries. Every chunk keeps `(source, page)`.
- Pages with fewer than 20 non-whitespace OCR characters (60 of 756) are flagged `low_text`, kept keyword-searchable, but not embedded.
- `hybrid_search()` (SQL) fuses Postgres full-text rank and pgvector cosine rank with Reciprocal Rank Fusion. Multi-word queries match on any term, with all-term matches ranked first; "Exact" mode in the UI is keyword-only.
- The chat route retrieves the top 8 chunks for the latest question, numbers them, and the model must cite `[n]`; the UI turns those into document + page chips linking to the reader.

## Scripts

| Script | What it does |
|---|---|
| `npm run db:migrate` | applies `supabase/migrations/*.sql` not yet applied (tracked in `_migrations`) |
| `npm run ingest [file]` | upserts pages + chunks from the JSONL (idempotent, keeps embeddings for unchanged chunks) |
| `npm run embed [--force]` | embeds chunks lacking vectors, using/updating the cache file |
| `npm run typecheck`, `npm run lint`, `npm run build` | what CI runs |
