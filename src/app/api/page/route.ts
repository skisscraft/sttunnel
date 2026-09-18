import { NextResponse } from "next/server";
import { getPage } from "@/lib/search";
import { sourceBySlug } from "@/lib/sources";

export const dynamic = "force-dynamic";

/** GET /api/page?doc=<slug>&page=<n> */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doc = sourceBySlug(searchParams.get("doc") ?? "");
  const page = Number(searchParams.get("page"));
  if (!doc || !Number.isInteger(page) || page < 1 || page > doc.pages) {
    return NextResponse.json({ error: "Unknown document or page" }, { status: 404 });
  }
  const row = await getPage(doc.file, page);
  if (!row) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  return NextResponse.json(row);
}
