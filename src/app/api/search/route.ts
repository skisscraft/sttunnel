import { NextResponse } from "next/server";
import { searchChunks, type SearchMode } from "@/lib/search";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=...&sources=Electrical%20Training,Pipe%20Jacking&limit=20&mode=hybrid|keyword|semantic
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ hits: [], mode: "hybrid", q });
  if (q.length > 500) return NextResponse.json({ error: "Query too long (max 500 characters)" }, { status: 400 });

  const sources = (searchParams.get("sources") ?? "").split(",").filter(Boolean);
  const limit = Number(searchParams.get("limit") ?? 20);
  const modeParam = searchParams.get("mode");
  const mode: SearchMode = modeParam === "keyword" || modeParam === "semantic" ? modeParam : "hybrid";

  try {
    const result = await searchChunks(q, { sources, limit, mode });
    return NextResponse.json({ q, ...result });
  } catch (err) {
    console.error("search failed", err);
    return NextResponse.json({ error: "Search is unavailable right now." }, { status: 500 });
  }
}
