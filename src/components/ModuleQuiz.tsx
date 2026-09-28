"use client";

import Link from "next/link";
import { useState } from "react";
import type { QuizQuestion } from "@/content/curriculum";
import { pageHref } from "@/lib/sources";
import { useProgress } from "./progress";

export function ModuleQuiz({ slug, source, quiz, nextSlug, nextTitle }: { slug: string; source: string; quiz: QuizQuestion[]; nextSlug?: string; nextTitle?: string }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const { progress, ready, setDone } = useProgress();
  const answered = Object.keys(picked).length;
  const correct = quiz.filter((q, i) => picked[i] === q.answer).length;
  const complete = Boolean(progress[slug]);

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold tracking-tight">Quick check</h2>
      <p className="mt-1 text-sm text-muted">Pick an answer; the source page is shown after each one.</p>
      <ol className="mt-3 space-y-4">
        {quiz.map((q, i) => {
          const chosen = picked[i];
          return (
            <li key={i} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-medium">
                {i + 1}. {q.q}
              </p>
              <ul className="mt-2 space-y-1.5">
                {q.options.map((opt, j) => {
                  const state = chosen === undefined ? "idle" : j === q.answer ? "correct" : j === chosen ? "wrong" : "muted";
                  return (
                    <li key={j}>
                      <button
                        type="button"
                        disabled={chosen !== undefined}
                        onClick={() => setPicked((p) => ({ ...p, [i]: j }))}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                          state === "correct"
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30"
                            : state === "wrong"
                              ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                              : state === "muted"
                                ? "border-border text-muted"
                                : "border-border hover:border-accent"
                        }`}
                      >
                        {opt}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {chosen !== undefined && (
                <p className="mt-2 text-xs text-muted">
                  {chosen === q.answer ? "Correct." : "Not quite."}{" "}
                  <Link href={pageHref(source, q.page)} className="font-medium text-accent-strong underline underline-offset-2">
                    See {source} p.{q.page}
                  </Link>
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-5 rounded-xl border border-border bg-surface p-4">
        {answered === quiz.length ? (
          <p className="text-sm">
            You got <strong>{correct} of {quiz.length}</strong>.{" "}
            {correct < quiz.length && "Re-read the linked pages for the ones you missed."}
          </p>
        ) : (
          <p className="text-sm text-muted">{answered} of {quiz.length} answered.</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!ready}
            onClick={() => setDone(slug, !complete)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${complete ? "border border-border" : "bg-accent text-white hover:bg-accent-strong"}`}
          >
            {complete ? "Mark as not done" : "Mark module complete"}
          </button>
          {nextSlug && (
            <Link href={`/course/${nextSlug}`} className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-accent">
              Next: {nextTitle} →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
