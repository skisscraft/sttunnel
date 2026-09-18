import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/SearchView";

export const metadata: Metadata = { title: "Manual" };

export default function ManualPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Manual</h1>
      <p className="mt-1 text-sm text-muted">Search the digitized training decks. Results link to the page they came from.</p>
      <div className="mt-4">
        <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
          <SearchView />
        </Suspense>
      </div>
    </div>
  );
}
