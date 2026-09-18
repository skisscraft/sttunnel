"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SOURCES, TOTAL_PAGES, pageHref } from "@/lib/sources";
import type { SearchHit, SearchMode } from "@/lib/search";
import { SourceBadge } from "./SourceBadge";
import { Snippet } from "./Snippet";

type State = { status: "idle" | "loading" | "done" | "error"; hits: SearchHit[]; mode?: SearchMode; error?: string };

const EXAMPLES = ["5 safety rules", "release limit mA", "proximity switch part number", "interjack station", "bentonite lubrication", "bladder accumulator"];

export function SearchView() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const initialSources = (params.get("sources") ?? "").split(",").filter(Boolean);
  const initialMode = params.get("mode") === "keyword" ? "keyword" : "hybrid";

  const [q, setQ] = useState(initialQ);
  const [selected, setSelected] = useState<string[]>(initialSources);
  const [mode, setMode] = useState<"hybrid" | "keyword">(initialMode);
  const [state, setState] = useState<State>({ status: "idle", hits: [] });
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useCallback(
    async (query: string, sources: string[], m: "hybrid" | "keyword") => {
      abortRef.current?.abort();
      const trimmed = query.trim();
      const sp = new URLSearchParams();
      if (trimmed) sp.set("q", trimmed);
      if (sources.length) sp.set("sources", sources.join(","));
      if (m !== "hybrid") sp.set("mode", m);
      router.replace(`/manual${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
      if (!trimmed) {
        setState({ status: "idle", hits: [] });
        return;
      }
      const controller = new AbortController();
      abortRef.current = controller;
      setState((s) => ({ ...s, status: "loading" }));
      try {
        const res = await fetch(`/api/search?${sp}&limit=25`, { signal: controller.signal });
        const data = (await res.json()) as { hits?: SearchHit[]; mode?: SearchMode; error?: string };
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
        setState({ status: "done", hits: data.hits ?? [], mode: data.mode });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState({ status: "error", hits: [], error: (err as Error).message });
      }
    },
    [router],
  );

  // Run the search from the URL on first load (deep links / back button).
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    if (initialQ) {
      const t = setTimeout(() => void runSearch(initialQ, initialSources, initialMode), 0);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSource = (name: string) => {
    const next = selected.includes(name) ? selected.filter((s) => s !== name) : [...selected, name];
    setSelected(next);
    void runSearch(q, next, mode);
  };

  const changeMode = (m: "hybrid" | "keyword") => {
    setMode(m);
    void runSearch(q, selected, m);
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void runSearch(q, selected, mode);
        }}
        className="flex gap-2"
      >
        <label className="sr-only" htmlFor="q">Search the training material</label>
        <input
          id="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${TOTAL_PAGES} pages…`}
          autoComplete="off"
          enterKeyHint="search"
          className="flex-1 min-w-0 rounded-lg border border-border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-50"
          disabled={state.status === "loading"}
        >
          Search
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setSelected([]);
            void runSearch(q, [], mode);
          }}
          className={chip(selected.length === 0)}
        >
          All documents
        </button>
        {SOURCES.map((s) => (
          <button key={s.name} type="button" onClick={() => toggleSource(s.name)} className={chip(selected.includes(s.name))} aria-pressed={selected.includes(s.name)}>
            {s.name} <span className="opacity-60">({s.pages})</span>
          </button>
        ))}
        <span className="ml-auto inline-flex rounded-md border border-border p-0.5 text-xs" role="group" aria-label="Search mode">
          <button type="button" onClick={() => changeMode("hybrid")} className={seg(mode === "hybrid")} title="Keyword + meaning (semantic) search">
            Smart
          </button>
          <button type="button" onClick={() => changeMode("keyword")} className={seg(mode === "keyword")} title="Keyword-only search (exact terms, part numbers)">
            Exact
          </button>
        </span>
      </div>

      <section className="mt-5" aria-live="polite">
        {state.status === "idle" && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-sm text-muted">
              Full-text and semantic search across the three digitized Herrenknecht Academy decks. Every result shows the document and page it came from.
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">Try</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setQ(ex);
                    void runSearch(ex, selected, mode);
                  }}
                  className="rounded-full border border-border bg-surface-2 px-3 py-1 text-sm hover:border-accent"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
        {state.status === "loading" && <p className="text-sm text-muted">Searching…</p>}
        {state.status === "error" && <p className="text-sm text-red-600">{state.error}</p>}
        {state.status === "done" && (
          <>
            <p className="text-xs text-muted">
              {state.hits.length === 0 ? "No matches." : `${state.hits.length} result${state.hits.length === 1 ? "" : "s"}`}
              {state.mode === "keyword" && mode === "hybrid" && " · semantic search unavailable, showing keyword matches"}
            </p>
            <ol className="mt-2 space-y-2">
              {state.hits.map((h) => (
                <li key={h.id}>
                  <Link
                    href={pageHref(h.source, h.page)}
                    className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <SourceBadge source={h.source} page={h.page} />
                      <span className="text-[11px] text-muted">
                        {h.fts_rank && h.semantic_rank ? "keyword + meaning" : h.fts_rank ? "keyword" : "meaning"}
                      </span>
                    </div>
                    <Snippet text={h.snippet} className="mt-2 text-sm leading-relaxed line-clamp-4" />
                  </Link>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </div>
  );
}

function chip(active: boolean) {
  return `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
    active ? "border-accent bg-accent-soft text-accent-strong" : "border-border bg-surface text-muted hover:text-foreground"
  }`;
}
function seg(active: boolean) {
  return `rounded px-2 py-1 font-medium ${active ? "bg-accent-soft text-accent-strong" : "text-muted"}`;
}
