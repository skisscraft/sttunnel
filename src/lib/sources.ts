/** The three source documents from Phase 1. Order here is the display order. */
export const SOURCES = [
  { name: "Electrical Training", file: "ELECTRICAL_TRAINING.pdf", slug: "electrical-training", pages: 234, short: "Electrical" },
  { name: "Pipe Jacking", file: "PIPE_JACKING.pdf", slug: "pipe-jacking", pages: 280, short: "Pipe Jacking" },
  { name: "Drawings & Part Lists", file: "DRAWINGS_AND_PART_LISTS.pdf", slug: "drawings-and-part-lists", pages: 242, short: "Drawings" },
] as const;

export type SourceName = (typeof SOURCES)[number]["name"];

export const TOTAL_PAGES = SOURCES.reduce((n, s) => n + s.pages, 0);

export function sourceBySlug(slug: string) {
  return SOURCES.find((s) => s.slug === slug);
}

export function sourceByName(name: string) {
  return SOURCES.find((s) => s.name === name);
}

export function isSourceName(name: string): name is SourceName {
  return SOURCES.some((s) => s.name === name);
}

/** Link to the reader view for a (source, page) pair. */
export function pageHref(sourceName: string, page: number) {
  const s = sourceByName(sourceName);
  return s ? `/manual/${s.slug}/${page}` : "/manual";
}
