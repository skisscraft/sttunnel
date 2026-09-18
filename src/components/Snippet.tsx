/** Renders a ts_headline snippet whose highlights are delimited by « … » as safe <mark> elements. */
export function Snippet({ text, className }: { text: string; className?: string }) {
  const compact = text.replace(/\s+/g, " ").trim();
  const parts = compact.split(/«|»/);
  return (
    <p className={className}>
      {parts.map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>))}
    </p>
  );
}
