import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SOURCES, sourceBySlug } from "@/lib/sources";
import { outlineFor, BEGINNER_TRACK } from "@/content/curriculum";
import { SourceBadge } from "@/components/SourceBadge";

type Params = Promise<{ doc: string }>;

export function generateStaticParams() {
  return SOURCES.map((s) => ({ slug: s.slug })).map(({ slug }) => ({ doc: slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const s = sourceBySlug((await params).doc);
  return { title: s ? `${s.name} contents` : "Document" };
}

export default async function DocContentsPage({ params }: { params: Params }) {
  const { doc } = await params;
  const s = sourceBySlug(doc);
  const outline = s ? outlineFor(s.name) : undefined;
  if (!s || !outline) notFound();
  const modules = BEGINNER_TRACK.filter((m) => m.source === s.name);

  return (
    <article>
      <Link href="/manual" className="text-sm text-muted hover:text-foreground">← Manual</Link>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SourceBadge source={s.name} />
        <span className="text-xs text-muted">{s.file} · {s.pages} pages</span>
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{s.name}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{outline.blurb}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={`/manual?sources=${encodeURIComponent(s.name)}`} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:border-accent">
          Search only this document
        </Link>
        <Link href={`/manual/${s.slug}/1`} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:border-accent">
          Open page 1
        </Link>
      </div>

      <h2 className="mt-6 text-lg font-semibold tracking-tight">Contents</h2>
      <ol className="mt-2 divide-y divide-border rounded-xl border border-border bg-surface">
        {outline.sections.map((sec, i) => (
          <li key={sec.title}>
            <Link href={`/manual/${s.slug}/${sec.pages[0]}`} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-2">
              <span className="w-6 shrink-0 text-xs font-semibold text-muted">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-snug">{sec.title}</span>
                {sec.note && <span className="mt-0.5 block text-xs text-muted">{sec.note}</span>}
              </span>
              <span className="shrink-0 text-xs text-muted">p.{sec.pages[0]}–{sec.pages[1]}</span>
            </Link>
          </li>
        ))}
      </ol>

      {modules.length > 0 && (
        <>
          <h2 className="mt-6 text-lg font-semibold tracking-tight">Beginner modules from this document</h2>
          <ul className="mt-2 space-y-2">
            {modules.map((m) => (
              <li key={m.slug}>
                <Link href={`/course/${m.slug}`} className="block rounded-xl border border-border bg-surface px-4 py-3 text-sm hover:border-accent">
                  {m.title} <span className="text-muted">· {m.minutes} min</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}
