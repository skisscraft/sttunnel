"use client";

import Link from "next/link";
import { BEGINNER_TRACK, TRACK_MINUTES } from "@/content/curriculum";
import { SourceBadge } from "./SourceBadge";
import { useProgress } from "./progress";

export function TrackList() {
  const { progress, ready, reset } = useProgress();
  const done = BEGINNER_TRACK.filter((m) => progress[m.slug]).length;
  const next = BEGINNER_TRACK.find((m) => !progress[m.slug]);

  return (
    <div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">
              {ready ? `${done} of ${BEGINNER_TRACK.length} modules completed` : `${BEGINNER_TRACK.length} modules`}
            </p>
            <p className="text-xs text-muted">About {TRACK_MINUTES} minutes in total. Progress is saved on this device.</p>
          </div>
          {next ? (
            <Link href={`/course/${next.slug}`} className="shrink-0 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white hover:bg-accent-strong">
              {done === 0 ? "Start" : "Continue"}
            </Link>
          ) : (
            ready && (
              <button type="button" onClick={reset} className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-medium">
                Reset
              </button>
            )
          )}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="h-full bg-accent transition-all" style={{ width: `${(done / BEGINNER_TRACK.length) * 100}%` }} />
        </div>
      </div>

      <ol className="mt-4 space-y-2">
        {BEGINNER_TRACK.map((m, i) => {
          const complete = Boolean(progress[m.slug]);
          return (
            <li key={m.slug}>
              <Link href={`/course/${m.slug}`} className="flex gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent">
                <span
                  className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    complete ? "bg-emerald-600 text-white" : "bg-surface-2 text-muted"
                  }`}
                  aria-label={complete ? "Completed" : `Module ${i + 1}`}
                >
                  {complete ? "✓" : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-snug">{m.title}</span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <SourceBadge source={m.source} short />
                    <span>{m.minutes} min</span>
                    <span>· {m.quiz.length} check questions</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
