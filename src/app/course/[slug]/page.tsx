import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BEGINNER_TRACK, moduleBySlug } from "@/content/curriculum";
import { pageHref, sourceByName } from "@/lib/sources";
import { SourceBadge } from "@/components/SourceBadge";
import { ModuleQuiz } from "@/components/ModuleQuiz";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return BEGINNER_TRACK.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const m = moduleBySlug((await params).slug);
  return { title: m ? m.title : "Module" };
}

export default async function ModulePage({ params }: { params: Params }) {
  const { slug } = await params;
  const index = BEGINNER_TRACK.findIndex((m) => m.slug === slug);
  if (index < 0) notFound();
  const m = BEGINNER_TRACK[index];
  const next = BEGINNER_TRACK[index + 1];
  const doc = sourceByName(m.source);

  return (
    <article>
      <Link href="/course" className="text-sm text-muted hover:text-foreground">← Beginner track</Link>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">Module {index + 1} of {BEGINNER_TRACK.length}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{m.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
        <SourceBadge source={m.source} />
        <span>{m.minutes} min</span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed">{m.summary}</p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold tracking-tight">Read</h2>
        <ul className="mt-2 space-y-2">
          {m.reading.map((r) => (
            <li key={r.label}>
              <Link href={pageHref(m.source, r.pages[0])} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 hover:border-accent">
                <span className="text-sm">{r.label}</span>
                <span className="shrink-0 text-xs text-muted">p.{r.pages[0]}–{r.pages[1]}</span>
              </Link>
            </li>
          ))}
        </ul>
        {doc && (
          <p className="mt-2 text-xs text-muted">
            Full outline: <Link href={`/manual/${doc.slug}`} className="underline underline-offset-2">{m.source} contents</Link>
          </p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold tracking-tight">Key points</h2>
        <ul className="mt-2 space-y-2">
          {m.keyPoints.map((k) => (
            <li key={k.page + k.text.slice(0, 20)} className="rounded-xl border border-border bg-surface px-4 py-3 text-[15px] leading-relaxed">
              {k.text}{" "}
              <Link href={pageHref(m.source, k.page)} className="ml-1 inline-flex items-center rounded bg-accent-soft px-1.5 text-[11px] font-semibold text-accent-strong align-[2px]" title={`${m.source}, page ${k.page}`}>
                p.{k.page}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ModuleQuiz slug={m.slug} source={m.source} quiz={m.quiz} nextSlug={next?.slug} nextTitle={next?.title} />

      <p className="mt-6 text-sm">
        Still unsure about something?{" "}
        <Link href={`/ask?q=${encodeURIComponent(`Explain: ${m.title}`)}`} className="font-medium text-accent-strong underline underline-offset-2">
          Ask the assistant
        </Link>
        .
      </p>
    </article>
  );
}
