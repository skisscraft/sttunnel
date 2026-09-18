import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/search";
import { sourceBySlug } from "@/lib/sources";
import { SourceBadge } from "@/components/SourceBadge";

export const dynamic = "force-dynamic";

type Params = Promise<{ doc: string; page: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { doc, page } = await params;
  const s = sourceBySlug(doc);
  return { title: s ? `${s.name} p.${page}` : "Page" };
}

export default async function ReaderPage({ params }: { params: Params }) {
  const { doc, page: pageParam } = await params;
  const s = sourceBySlug(doc);
  const page = Number(pageParam);
  if (!s || !Number.isInteger(page) || page < 1 || page > s.pages) notFound();
  const row = await getPage(s.file, page);
  if (!row) notFound();

  const prev = page > 1 ? `/manual/${s.slug}/${page - 1}` : null;
  const next = page < s.pages ? `/manual/${s.slug}/${page + 1}` : null;

  return (
    <article>
      <div className="flex items-center justify-between gap-3">
        <Link href="/manual" className="text-sm text-muted hover:text-foreground">← Search</Link>
        <Link href={`/ask?q=${encodeURIComponent(`What does ${s.name} page ${page} say?`)}`} className="text-sm font-medium text-accent-strong">
          Ask about this page
        </Link>
      </div>

      <header className="mt-3 flex flex-wrap items-center gap-2">
        <SourceBadge source={row.source} />
        <h1 className="text-lg font-semibold tracking-tight">
          Page {page} <span className="text-muted font-normal">of {s.pages}</span>
        </h1>
        <span className="text-xs text-muted">{row.source_file}</span>
      </header>

      {row.low_text && (
        <p className="mt-3 rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-muted">
          OCR extracted very little text from this page. It is most likely a photo or diagram slide; check the original PDF.
        </p>
      )}

      <pre className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-border bg-surface p-4 font-sans text-[15px] leading-relaxed">
        {row.text || "(no text on this page)"}
      </pre>
      <p className="mt-2 text-[11px] text-muted">Raw OCR text, shown as digitized. Misreads on stylised or diagram-heavy slides are expected.</p>

      <nav className="mt-5 flex items-center justify-between gap-2" aria-label="Page navigation">
        {prev ? <Link href={prev} className={navBtn}>← Page {page - 1}</Link> : <span />}
        {next ? <Link href={next} className={navBtn}>Page {page + 1} →</Link> : <span />}
      </nav>
    </article>
  );
}

const navBtn = "rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium hover:border-accent";
