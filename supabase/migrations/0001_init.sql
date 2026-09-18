-- TBM Academy — Phase 2 schema
-- Applies cleanly on Supabase (Postgres 15/17 + pgvector) and on a local Postgres with pgvector installed.

create extension if not exists vector;

-- One row per digitized page (756 rows: 234 Electrical Training + 280 Pipe Jacking + 242 Drawings & Part Lists).
create table if not exists training_pages (
  id           bigserial primary key,
  source       text    not null,               -- human document name, e.g. "Electrical Training"
  source_file  text    not null,               -- original file name, e.g. "ELECTRICAL_TRAINING.pdf"
  page         integer not null,               -- 1-based page number inside the source document
  text         text    not null,               -- raw OCR text, stored as-is (never "fixed")
  char_count   integer not null default 0,
  low_text     boolean not null default false, -- OCR extracted almost nothing (photo-heavy slide)
  created_at   timestamptz not null default now(),
  unique (source_file, page)
);

create index if not exists training_pages_source_idx on training_pages (source, page);

-- Retrieval unit. Default is one chunk per page; very long pages are split into several chunks,
-- each still carrying the exact (source, page) it came from so every hit can be cited.
create table if not exists training_chunks (
  id           bigserial primary key,
  page_id      bigint  not null references training_pages (id) on delete cascade,
  source       text    not null,
  source_file  text    not null,
  page         integer not null,
  chunk_index  integer not null default 0,
  content      text    not null,
  embedding    vector(768),                    -- gemini-embedding-001, 768 dims, L2-normalised
  embedding_model text,
  fts          tsvector generated always as (to_tsvector('english', content)) stored,
  unique (source_file, page, chunk_index)
);

create index if not exists training_chunks_fts_idx       on training_chunks using gin (fts);
create index if not exists training_chunks_source_idx    on training_chunks (source);
create index if not exists training_chunks_page_idx      on training_chunks (source_file, page);
create index if not exists training_chunks_embedding_idx on training_chunks
  using hnsw (embedding vector_cosine_ops);

-- Hybrid search: full-text rank and vector rank fused with Reciprocal Rank Fusion.
-- query_embedding may be NULL, in which case only full-text search runs.
create or replace function hybrid_search(
  query_text       text,
  query_embedding  vector(768) default null,
  match_count      integer     default 20,
  filter_sources   text[]      default null,
  full_text_weight double precision default 1.0,
  semantic_weight  double precision default 1.0,
  rrf_k            integer     default 50
)
returns table (
  id            bigint,
  source        text,
  source_file   text,
  page          integer,
  chunk_index   integer,
  content       text,
  snippet       text,
  score         double precision,
  fts_rank      integer,
  semantic_rank integer
)
language sql
stable
as $$
  with q as (
    -- tsq_all: every term must match (websearch semantics). tsq_any: the same query with
    -- AND relaxed to OR, so multi-word questions still hit pages that contain some terms;
    -- rows matching all terms are ranked first.
    select tsq_all,
           case when tsq_all is null or tsq_all::text = '' then null
                else to_tsquery('english', replace(tsq_all::text, ' & ', ' | ')) end as tsq_any
    from (select case when coalesce(trim(query_text), '') = '' then null
                      else websearch_to_tsquery('english', query_text) end as tsq_all) t
  ),
  full_text as (
    select c.id,
           row_number() over (
             order by (c.fts @@ q.tsq_all) desc, ts_rank_cd(c.fts, q.tsq_any) desc, c.id
           ) as rank_ix
    from training_chunks c, q
    where q.tsq_any is not null
      and c.fts @@ q.tsq_any
      and (filter_sources is null or c.source = any (filter_sources))
    order by rank_ix
    limit least(match_count, 30) * 2
  ),
  semantic as (
    select c.id,
           row_number() over (order by c.embedding <=> query_embedding, c.id) as rank_ix
    from training_chunks c
    where query_embedding is not null
      and c.embedding is not null
      and (filter_sources is null or c.source = any (filter_sources))
    order by c.embedding <=> query_embedding
    limit least(match_count, 30) * 2
  ),
  fused as (
    select coalesce(f.id, s.id) as id,
           coalesce(1.0 / (rrf_k + f.rank_ix), 0.0) * full_text_weight
         + coalesce(1.0 / (rrf_k + s.rank_ix), 0.0) * semantic_weight as score,
           f.rank_ix as fts_rank,
           s.rank_ix as semantic_rank
    from full_text f
    full outer join semantic s on f.id = s.id
  )
  select c.id, c.source, c.source_file, c.page, c.chunk_index, c.content,
         case
           when q.tsq_any is not null then
             ts_headline('english', c.content, q.tsq_any,
               'MaxWords=40, MinWords=20, MaxFragments=2, FragmentDelimiter= … , StartSel=«, StopSel=»')
           else left(c.content, 240)
         end as snippet,
         fused.score,
         fused.fts_rank::integer,
         fused.semantic_rank::integer
  from fused
  join training_chunks c on c.id = fused.id
  cross join q
  order by fused.score desc, c.source, c.page
  limit match_count;
$$;

-- Read-only access for the Supabase anon role (harmless for an internal tool, lets supabase-js read if ever needed).
alter table training_pages  enable row level security;
alter table training_chunks enable row level security;
drop policy if exists "training_pages_read"  on training_pages;
drop policy if exists "training_chunks_read" on training_chunks;
create policy "training_pages_read"  on training_pages  for select using (true);
create policy "training_chunks_read" on training_chunks for select using (true);
