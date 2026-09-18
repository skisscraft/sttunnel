import Link from "next/link";

export function ComingSoon({ title, blurb, bullets }: { title: string; blurb: string; bullets: string[] }) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-border bg-surface p-6">
      <span className="inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-accent-strong">
        Coming soon
      </span>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted">{blurb}</p>
      <ul className="mt-4 space-y-1.5 text-sm text-muted list-disc pl-5">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <p className="mt-6 text-sm">
        In the meantime, use{" "}
        <Link href="/manual" className="font-medium text-accent-strong underline underline-offset-2">
          Manual
        </Link>{" "}
        to search the material or{" "}
        <Link href="/ask" className="font-medium text-accent-strong underline underline-offset-2">
          Ask
        </Link>{" "}
        to get a cited answer.
      </p>
    </div>
  );
}
