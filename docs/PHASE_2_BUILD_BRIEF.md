# Build Brief — TBM Training Platform, Phase 1 & 2
**For: autonomous build (Claude Code / Fable). Goal: minimal clarifying questions back to the requester.**

## What this is
A standalone web app (separate from kianhock.ai, which is public/client-facing) that turns Herrenknecht
Academy training material into a searchable internal reference with an AI chatbot. This brief covers
Phase 1 (content already digitized — see below) and Phase 2 (the app itself). Phases 3–4 (beginner
course, multi-brand expansion) are out of scope for this build.

## Inputs (already done — Phase 1 output)
Three files, ready to ingest as-is:
- `tbm_training_digitized.jsonl` — one JSON object per page: `{source, source_file, page, text}`.
  756 records total (234 Electrical Training + 280 Pipe Jacking + 242 Drawings & Part Lists).
- `tbm_training_manifest.json` — per-document page counts and a `low_text_pages` count (pages where
  OCR extracted almost nothing, usually photo-heavy slides — expected, not a bug).
- `*_digitized.md` — same content as readable per-document markdown, for spot-checking.

**Known data quality note:** OCR accuracy is good on text-heavy slides, noisier on stylized cover
pages and diagram-heavy pages (expect occasional misreads, e.g. a character or two per word). Good
enough to ship for v1 search/chat; do not silently "fix" text by inventing content — if a chunk looks
corrupted, it's fine to surface it as-is with its page citation.

## Tech stack (default — do not ask, just proceed)
- **Platform:** Next.js + Supabase, deployed via Vercel. (Note: the original version of this brief
  specified Lovable, reusing the kianhock.ai stack — that's the right call when a Lovable connector is
  driving the build directly. For an unattended Claude Code session, a plain code-first stack is more
  reliable: no dependency on a second platform's own agent, everything drivable from the CLI with tools
  already authenticated on this machine.)
- **Chat model:** Claude API (same pattern as kianhock.ai's chatbot).
- **Auth:** none required for v1 — this is an internal tool, not public. Skip login unless the deploy
  target requires it.
- **Prerequisites this session assumes are already done:** `supabase login` and `vercel login` (or
  equivalent) completed on this machine. If either is missing, don't hang waiting for interactive
  auth — write the blocker to `BLOCKERS.md` and continue with whatever can proceed without it (e.g.
  finish the app against a local Supabase instance, skip the live deploy step).

## Data architecture
1. Ingest `tbm_training_digitized.jsonl` into a Supabase table (`training_pages` or similar): columns
   for `source`, `source_file`, `page`, `text`.
2. Chunk long pages / merge very short ones as needed for embedding (use judgment — page boundaries
   are a reasonable default chunk unit since citations are per-page).
3. Generate embeddings for semantic search (Supabase pgvector or equivalent).
4. Keep `source` + `page` attached to every chunk — every chatbot answer and every search result must
   be able to cite exactly which document and page it came from.

## Features to build (v1 — matches the "Manual" + "Ask" areas from the proposal)
1. **Manual (search)** — full-text + semantic search across all 756 pages. Results show document name,
   page number, and a text snippet. Filterable by source document (Electrical Training / Pipe Jacking /
   Drawings & Part Lists).
2. **Ask (chatbot)** — RAG chatbot grounded only in the ingested content. Every answer cites source
   document + page. If the answer isn't in the material, say so — never fabricate.
3. **Nav shell only, not built out this round:** "Course" and "Troubleshoot" sections should exist as
   nav items with a simple "coming soon" state — do not build real functionality for these yet
   (no content source exists for them — see the proposal deck's "Honest Limits" slide).

## Explicit non-goals for this build
- No user accounts / auth
- No course curriculum content
- No real troubleshooting/diagnostic logic
- No content beyond the 756 pages provided

## Acceptance criteria
- [ ] All 756 pages searchable, correct source + page number shown per result
- [ ] Chatbot answers cite source + page, and declines gracefully when content isn't covered
- [ ] Works on mobile-width viewport (this will likely be checked on a phone first)
- [ ] Deployed to a working URL, no auth wall

## Naming
No name has been locked in. Default to a working title like **"TBM Academy"** in the UI/repo and treat
it as a placeholder — do not block progress on naming; it can be renamed later in one pass.
