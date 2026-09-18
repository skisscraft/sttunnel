import { NextResponse } from "next/server";
import { corpusStats } from "@/lib/search";
import { embeddingsAvailable } from "@/lib/embeddings";
import { resolveProvider, providerLabel } from "@/lib/llm";
import { TOTAL_PAGES } from "@/lib/sources";

export const dynamic = "force-dynamic";

/** GET /api/health — quick deploy check: database reachable, corpus loaded, models configured. */
export async function GET() {
  const provider = resolveProvider();
  const base = {
    embeddings: embeddingsAvailable() ? "gemini-embedding-001" : null,
    chat: provider ? { provider, model: providerLabel(provider) } : null,
    expected_pages: TOTAL_PAGES,
  };
  try {
    const stats = await corpusStats();
    const pages = stats.reduce((n, s) => n + s.pages, 0);
    const embedded = stats.reduce((n, s) => n + s.embedded, 0);
    const ok = pages === TOTAL_PAGES && embedded > 0 && Boolean(provider);
    return NextResponse.json({ ok, database: "ok", pages, embedded_chunks: embedded, by_source: stats, ...base }, { status: ok ? 200 : 503 });
  } catch (err) {
    console.error("health check failed", err);
    return NextResponse.json({ ok: false, database: "error", ...base }, { status: 503 });
  }
}
