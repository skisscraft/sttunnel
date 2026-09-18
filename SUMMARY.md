# SUMMARY — TBM Academy, Phase 2 build

**Status:** app built and verified end to end locally; **not deployed** because no Supabase, Vercel or Anthropic
credentials were on the build machine (details and 5-minute unblock steps in `BLOCKERS.md`).
Code is pushed to `skisscraft/sttunnel`, branch `claude/phase-2-build-brief-dxel2h`.

**Deployed URL:** none yet. Once you import the repo into Vercel and set three env vars (below), the URL is live.

## What was built

| Area | Delivered |
|---|---|
| Data | `data/tbm_training_digitized.jsonl` rebuilt from the three `*_digitized.md` files (the JSONL itself was not in the upload); 756 records, character counts match the manifest exactly. |
| Schema | `supabase/migrations/0001_init.sql`: `training_pages` (756 rows), `training_chunks` (758 rows; one chunk per page, long pages split, every chunk keeps source + page), tsvector + GIN index, `vector(768)` + HNSW index, `hybrid_search()` SQL function (full-text ∪ semantic, fused with reciprocal rank fusion, per-source filter, highlighted snippets). |
| Pipeline | `npm run db:migrate`, `npm run ingest`, `npm run embed` (idempotent). Embeddings: `gemini-embedding-001`, 768 dims; 698 chunks embedded, the 60 pages with under 20 characters of OCR text are flagged `low_text` and left keyword-only. Vectors are cached in `data/tbm_training_embeddings.jsonl` (5.6 MB), so loading Supabase needs no embedding calls. |
| Manual | `/manual`: search box, document filter chips (All / Electrical Training / Pipe Jacking / Drawings & Part Lists), Smart (hybrid) vs Exact (keyword) toggle, results with document badge, page number and highlighted snippet, state kept in the URL. Each result opens `/manual/<doc>/<page>`, a reader showing the raw OCR text with prev/next page navigation and a low-text notice where relevant. |
| Ask | `/ask`: streaming chat grounded only in retrieved chunks (top 8 per question). The model must cite `[n]`; the UI renders those as chips that link to the cited page and lists the sources under each answer. Off-topic questions get "The training material provided does not cover…". Optional per-document scoping. Multi-turn (last 6 turns kept). |
| Course / Troubleshoot | Nav items with a "coming soon" page each, no functionality (per brief). |
| API | `GET /api/search`, `POST /api/chat` (NDJSON stream), `GET /api/page`, `GET /api/health` (deploy check). |
| Chat model | Claude via `@anthropic-ai/sdk` (`claude-opus-5`, adaptive thinking, effort `medium`, streaming, cached system prompt). With no Anthropic key the app falls back to `gemini-2.5-flash` automatically so it still works. `ANTHROPIC_MODEL`, `ANTHROPIC_EFFORT`, `CHAT_PROVIDER` are configurable. |
| Ops | README with setup/deploy steps, `.env.example`, GitHub Actions CI (lint, typecheck, build), `docs/screenshots/`. |

## Verification done

- `npm run lint`, `npm run typecheck`, `npm run build` pass.
- Migration, ingest and embed run against a local Postgres 16 + pgvector 0.8.0; `/api/health` reports 756 pages / 698 embedded chunks.
- Search checked via API: "what current is fatal to humans" → Electrical Training p.25 first; "29600888" with the Drawings filter → p.22/19/21; multi-word queries fall back to any-term matching with all-term hits first.
- Chat checked via API (on the Gemini fallback): the 5 safety rules answer cites Electrical Training p.30 for every rule; a Toyota Hilux tyre-pressure question is declined as not covered.
- Playwright at 390×844 (iPhone-size) and 1280×800: Manual, reader, Ask and Course pages render with no horizontal overflow (`docs/screenshots/`).

## Acceptance criteria

- [x] All 756 pages searchable, correct source + page number shown per result (verified locally)
- [x] Chatbot answers cite source + page, declines gracefully when content isn't covered (verified on the fallback model; Claude path written but not exercised, no key)
- [x] Works on mobile-width viewport (screenshots)
- [ ] Deployed to a working URL, no auth wall — **blocked on Vercel + Supabase credentials**

## To go live (your side, ~10 minutes)

1. Supabase: create a project, copy the Transaction pooler URI → `DATABASE_URL` in `.env.local`, run `npm install && npm run db:setup`.
2. Vercel: import the repo, set `DATABASE_URL`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, deploy, open `/api/health`.
3. Merge or keep working from branch `claude/phase-2-build-brief-dxel2h`.

## Things for your review

- **Chat model choice / cost.** Defaulted to `claude-opus-5` as the Claude default. For a high-volume internal tool, `ANTHROPIC_MODEL=claude-sonnet-5` is a reasonable cheaper setting; one env var change.
- **Prompt tuned on the fallback model only.** After setting the Anthropic key, try a few questions on the Ask page and check the citation behaviour; the system prompt is in `src/lib/rag.ts`.
- **Embedding provider is Gemini, not Claude/Voyage.** The Claude API has no embeddings endpoint and Gemini was the only embedding key available. Swapping providers means changing `src/lib/embeddings.ts` and the `vector(768)` width, then `npm run embed -- --force`.
- **Low-text threshold.** Pages under 20 non-whitespace OCR characters are treated as photo slides (60 pages; the manifest counted 46 with its own threshold). They still show up in keyword search and the reader, just not in semantic results.
- **No auth.** As specified. The app sends `noindex`, but the URL is open once deployed; Vercel password protection is the quickest guard if needed.
- **Naming.** "TBM Academy" is used as the working title in the UI, `package.json`, and metadata; rename in one pass later.
