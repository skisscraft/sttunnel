import type { Metadata } from "next";
import { TrackList } from "@/components/TrackList";

export const metadata: Metadata = { title: "Course" };

export default function CoursePage() {
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Beginner track</h1>
      <p className="mt-1 text-sm text-muted">
        A guided path through the three training decks for someone new to pipe jacking TBMs. Each module points to the pages to read, lists the key points with their page, and ends with a short check.
      </p>
      <div className="mt-4">
        <TrackList />
      </div>
      <p className="mt-6 text-xs text-muted">
        Content is drawn from the digitized Herrenknecht Academy material only. It is an orientation aid, not a replacement for the original training or the machine&apos;s operating manual.
      </p>
    </div>
  );
}
