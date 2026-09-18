import { sourceByName } from "@/lib/sources";

const colours: Record<string, string> = {
  "Electrical Training": "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200",
  "Pipe Jacking": "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  "Drawings & Part Lists": "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200",
};

export function SourceBadge({ source, page, short }: { source: string; page?: number; short?: boolean }) {
  const s = sourceByName(source);
  const label = short && s ? s.short : source;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${colours[source] ?? "bg-surface-2 text-muted"}`}>
      <span>{label}</span>
      {page !== undefined && <span className="opacity-70">· p.{page}</span>}
    </span>
  );
}
