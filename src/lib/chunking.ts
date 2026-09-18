/**
 * Chunking policy (see docs/PHASE_2_BUILD_BRIEF.md → Data architecture):
 *  - The page is the default chunk unit, because citations are per page.
 *  - Pages longer than MAX_CHUNK_CHARS are split at paragraph boundaries into
 *    chunks of roughly TARGET_CHUNK_CHARS; every chunk keeps its (source, page).
 *  - Very short pages are NOT merged into neighbours (that would blur citations);
 *    they are stored and full-text searchable, but flagged `low_text` and skipped
 *    for embedding so OCR noise does not pollute semantic results.
 */
export const MAX_CHUNK_CHARS = 1800;
export const TARGET_CHUNK_CHARS = 1200;
export const LOW_TEXT_THRESHOLD = 20; // non-whitespace characters

export function nonWhitespaceLength(text: string) {
  return text.replace(/\s+/g, "").length;
}

export function isLowText(text: string) {
  return nonWhitespaceLength(text) < LOW_TEXT_THRESHOLD;
}

export function chunkPage(text: string): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (clean.length <= MAX_CHUNK_CHARS) return [clean];

  const paragraphs = clean.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const p of paragraphs) {
    const candidate = current ? `${current}\n\n${p}` : p;
    if (candidate.length > TARGET_CHUNK_CHARS && current) {
      chunks.push(current);
      current = p;
    } else {
      current = candidate;
    }
    // A single paragraph longer than MAX: hard-split on line breaks / length.
    while (current.length > MAX_CHUNK_CHARS) {
      let cut = current.lastIndexOf("\n", MAX_CHUNK_CHARS);
      if (cut < TARGET_CHUNK_CHARS / 2) cut = MAX_CHUNK_CHARS;
      chunks.push(current.slice(0, cut).trim());
      current = current.slice(cut).trim();
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/** Text that is embedded: prefix with the document + page so the vector carries that context. */
export function embeddingInput(source: string, page: number, content: string) {
  return `${source} — page ${page}\n${content}`;
}
