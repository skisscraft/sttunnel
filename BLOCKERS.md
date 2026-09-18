# Blockers

Things this unattended build could not complete because credentials were not available on the build machine.
Everything else in the brief is built and verified locally (see `SUMMARY.md`).

## 1. Supabase — no project / no credentials  (blocks: hosted database)

- `supabase login` had not been run; no `SUPABASE_ACCESS_TOKEN`, project URL, or database password was present, and the
  Supabase CLI is not installed. A project cannot be created or migrated without these.
- **What was done instead:** the full schema, ingestion and embedding pipeline were built and verified end to end against
  a local Postgres 16 + pgvector 0.8.0 instance (same SQL Supabase runs). All 756 pages and 758 chunks load; 698 chunks
  are embedded (60 low-text pages are keyword-only by design). The vectors are cached in
  `data/tbm_training_embeddings.jsonl`, so filling the Supabase project needs no embedding API calls.
- **To unblock (≈5 minutes):** create a Supabase project → copy the *Transaction pooler* connection string into
  `DATABASE_URL` in `.env.local` → `npm run db:setup`. That applies `supabase/migrations/0001_init.sql`, ingests
  the JSONL, and loads the cached embeddings.

## 2. Vercel — not logged in  (blocks: live deployment URL)

- `vercel login` had not been run; no `VERCEL_TOKEN` in the environment and no Vercel CLI installed. Deployment therefore
  did not happen and there is no live URL yet.
- **What was done instead:** the production build (`next build`) passes, and the app was run with `next start` and
  exercised with curl and Playwright (phone and desktop viewports). The code is pushed to GitHub
  (`skisscraft/sttunnel`, branch `claude/phase-2-build-brief-dxel2h`) with a CI workflow (lint, typecheck, build).
- **To unblock (≈5 minutes):** in Vercel, *Add New → Project → Import* the GitHub repo (or run `vercel` locally), set the
  env vars `DATABASE_URL`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, deploy, then open `/api/health` on the deployment.

## 3. Anthropic API key — not present  (degrades: chat runs on the fallback model until set)

- No `ANTHROPIC_API_KEY` (or `ant auth` profile) was available, so the Claude chat path could not be exercised live.
- **What was done instead:** the chat layer is written against the official `@anthropic-ai/sdk` (model `claude-opus-5`,
  adaptive thinking, streaming, cached system prompt) and typechecks. Because a working `GEMINI_API_KEY` *was* present,
  the app automatically falls back to `gemini-2.5-flash` for chat when no Anthropic key is set, which is how the RAG
  pipeline (retrieval → numbered sources → cited answer / graceful decline) was verified.
- **To unblock:** set `ANTHROPIC_API_KEY` in Vercel (and `.env.local`). Claude is then used automatically; set
  `CHAT_PROVIDER=anthropic` to disable the fallback entirely. Please sanity-check one or two answers on Claude after
  switching, since the prompt was only exercised on the fallback model.

## Notes on inputs

- `tbm_training_digitized.jsonl` was not among the uploaded files; only the manifest and the three `*_digitized.md`
  files were. The JSONL was rebuilt from the markdown (one record per `## Page N`), and the result matches the manifest
  exactly: 234 + 280 + 242 = 756 records and identical `total_chars` per document. It is committed at
  `data/tbm_training_digitized.jsonl`. If you have the original JSONL, drop it in the same path and re-run `npm run ingest`;
  nothing else changes.
