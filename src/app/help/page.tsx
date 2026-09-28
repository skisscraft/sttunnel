import type { Metadata } from "next";
import Link from "next/link";
import { SOURCES, TOTAL_PAGES } from "@/lib/sources";

export const metadata: Metadata = { title: "Help" };

export default function HelpPage() {
  return (
    <article>
      <h1 className="text-xl font-semibold tracking-tight">User guide</h1>
      <p className="mt-1 text-sm text-muted">
        How to use TBM Academy. This is a guide to the app itself, not the training content — for that, use{" "}
        <Link href="/manual" className="underline underline-offset-2">Manual</Link> or{" "}
        <Link href="/ask" className="underline underline-offset-2">Ask</Link>.
      </p>

      <section className="mt-6 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-lg font-semibold tracking-tight">What this app is</h2>
        <p className="mt-2 text-[15px] leading-relaxed">
          TBM Academy turns the Herrenknecht Academy training slides into a searchable reference you can use on
          site, on a phone or a desktop. It covers three decks — <strong>{SOURCES.map((s) => s.name).join(", ")}</strong> —{" "}
          {TOTAL_PAGES} pages in total. There is no login: anyone with the link can use it.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold tracking-tight">The four sections</h2>
        <div className="mt-2 space-y-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="font-medium">
              <Link href="/manual" className="text-accent-strong hover:underline underline-offset-2">Manual</Link>
            </h3>
            <p className="mt-1 text-sm leading-relaxed">
              Search all {TOTAL_PAGES} pages by keyword or by meaning. Type a word, a part number, or a question and
              press <strong>Search</strong>. Use the document chips to narrow results to one deck, and the{" "}
              <strong>Smart / Exact</strong> toggle to switch between meaning-aware search and exact keyword matching
              (useful for part numbers and codes). Tap a result to open the original page, with previous/next
              navigation and the raw digitized text.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="font-medium">
              <Link href="/ask" className="text-accent-strong hover:underline underline-offset-2">Ask</Link>
            </h3>
            <p className="mt-1 text-sm leading-relaxed">
              Ask a question in plain language and get an answer with numbered citations, e.g. <code>[2]</code>. Tap a
              citation to open the exact page it came from. If the material does not cover your question, the
              assistant says so instead of guessing. You can restrict answers to one document with the chips above
              the chat box.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="font-medium">
              <Link href="/course" className="text-accent-strong hover:underline underline-offset-2">Course</Link>
            </h3>
            <p className="mt-1 text-sm leading-relaxed">
              A guided beginner track of short modules built from the material, for someone new to pipe jacking TBMs.
              Each module lists the pages to read, the key points (each with its source page), and a short check with
              answers. Progress is saved in your browser on this device only — it is not synced to an account, so it
              will reset if you clear site data or switch devices.
            </p>
          </div>
          <div className="rounded-xl border border-dashed border-border bg-surface p-4">
            <h3 className="font-medium text-muted">Troubleshoot <span className="text-xs font-normal uppercase tracking-wide">coming soon</span></h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Guided fault-finding is planned for a later phase; there is no diagnostic content yet. Use Ask for now
              — it can often point you to the relevant maintenance or troubleshooting pages.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-lg font-semibold tracking-tight">Tips</h2>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
          <li>Searching for a part or material number (e.g. <code>29600888</code>)? Use <strong>Exact</strong> mode — it matches the literal text instead of meaning.</li>
          <li>Every result and every citation shows the document and page number, so you can always find it in the original.</li>
          <li>Ask remembers the last few messages in a conversation, so you can ask a follow-up without repeating context.</li>
          <li>On a phone, use the bottom tab bar; on a desktop, the same sections are in the top navigation.</li>
          <li>The content is OCR text from scanned training slides. Occasional misreads (a character or two) are expected, especially on stylised titles and diagrams — when in doubt, open the page and check the original layout.</li>
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-lg font-semibold tracking-tight">What this app does not do</h2>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
          <li>It only knows the {TOTAL_PAGES} pages of the three decks above — nothing else, and nothing newer.</li>
          <li>It is not a substitute for the machine&apos;s official operating manual or for qualified-electrician sign-off on electrical work.</li>
          <li>There is no user account or saved history beyond this browser&apos;s local course progress.</li>
        </ul>
      </section>
    </article>
  );
}
