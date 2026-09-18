import type { Metadata } from "next";
import { Suspense } from "react";
import { ChatView } from "@/components/ChatView";

export const metadata: Metadata = { title: "Ask" };

export default function AskPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Ask</h1>
      <p className="mt-1 text-sm text-muted">Cited answers from the training material. Nothing outside the three decks.</p>
      <div className="mt-4">
        <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
          <ChatView />
        </Suspense>
      </div>
    </div>
  );
}
