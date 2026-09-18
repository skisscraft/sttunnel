"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { SOURCES, pageHref } from "@/lib/sources";
import type { Citation } from "@/lib/rag";
import { SourceBadge } from "./SourceBadge";

type Message =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "assistant"; content: string; citations: Citation[]; model?: string; status: "streaming" | "done" | "error" };

const STARTERS = [
  "What are the 5 safety rules before working on electrical equipment?",
  "At what current does ventricular fibrillation start?",
  "How do I find the part number for a proximity switch on the gate valve?",
  "What is the maximum drive length guideline for ID 1600 pipe jacking?",
  "How does a bladder accumulator work?",
];

let counter = 0;
const nextId = () => `m${Date.now()}-${counter++}`;

export function ChatView() {
  const params = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(params.get("q") ?? "");
  const [sources, setSources] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function send(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    const userMsg: Message = { id: nextId(), role: "user", content: q };
    const assistantId = nextId();
    const history = messages.filter((m) => m.role === "user" || (m.role === "assistant" && m.status === "done"));
    setMessages([...messages, userMsg, { id: assistantId, role: "assistant", content: "", citations: [], status: "streaming" }]);
    setInput("");
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;

    const update = (patch: Partial<Extract<Message, { role: "assistant" }>>) =>
      setMessages((ms) => ms.map((m) => (m.id === assistantId && m.role === "assistant" ? { ...m, ...patch } : m)));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: q }],
          sources,
        }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (!line.trim()) continue;
          const ev = JSON.parse(line) as
            | { type: "sources"; citations: Citation[]; model: string }
            | { type: "delta"; text: string }
            | { type: "done" }
            | { type: "error"; message: string };
          if (ev.type === "sources") update({ citations: ev.citations, model: ev.model });
          else if (ev.type === "delta") {
            text += ev.text;
            update({ content: text });
          } else if (ev.type === "error") update({ content: text || ev.message, status: "error" });
          else if (ev.type === "done") update({ status: "done" });
        }
      }
      setMessages((ms) => ms.map((m) => (m.id === assistantId && m.role === "assistant" && m.status === "streaming" ? { ...m, status: "done" } : m)));
    } catch (err) {
      if ((err as Error).name !== "AbortError") update({ content: (err as Error).message, status: "error" });
    } finally {
      setBusy(false);
    }
  }

  const toggleSource = (name: string) =>
    setSources((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));

  return (
    <div className="flex flex-col min-h-[60vh]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Answer from:</span>
        <button type="button" onClick={() => setSources([])} className={chip(sources.length === 0)}>All documents</button>
        {SOURCES.map((s) => (
          <button key={s.name} type="button" onClick={() => toggleSource(s.name)} className={chip(sources.includes(s.name))} aria-pressed={sources.includes(s.name)}>
            {s.short}
          </button>
        ))}
      </div>

      <div className="mt-4 flex-1 space-y-4">
        {messages.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-sm text-muted">
              Ask a question about the training material. Answers are grounded only in the three digitized decks and cite the document and page. If the material does not cover something, the assistant says so.
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">Try</p>
            <ul className="mt-2 space-y-1.5">
              {STARTERS.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => void send(s)} className="text-left text-sm text-accent-strong hover:underline underline-offset-2">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-[15px] text-white whitespace-pre-wrap">{m.content}</div>
            </div>
          ) : (
            <AssistantBubble key={m.id} message={m} />
          ),
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="sticky bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-4 mt-4 flex gap-2 rounded-xl border border-border bg-surface p-2 shadow-sm"
      >
        <label htmlFor="ask" className="sr-only">Your question</label>
        <textarea
          id="ask"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={1}
          placeholder="Ask about the training material…"
          className="flex-1 min-w-0 resize-none bg-transparent px-2 py-2 text-base outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="self-end rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-50"
        >
          {busy ? "…" : "Ask"}
        </button>
      </form>
    </div>
  );
}

function AssistantBubble({ message }: { message: Extract<Message, { role: "assistant" }> }) {
  const cites = new Map(message.citations.map((c) => [c.n, c]));
  // Turn [3] into a markdown link so it renders as a citation chip.
  const text = message.content.replace(/\[(\d{1,2})\]/g, (whole, n) => (cites.has(Number(n)) ? `[${n}](#cite-${n})` : whole));
  const used = new Set<number>();
  for (const m of message.content.matchAll(/\[(\d{1,2})\]/g)) used.add(Number(m[1]));
  const shown = message.citations.filter((c) => used.has(c.n));

  return (
    <div className="flex justify-start">
      <div className="max-w-[95%] rounded-2xl rounded-bl-sm border border-border bg-surface px-4 py-3 text-[15px] leading-relaxed">
        {message.content ? (
          <div className={`prose-answer ${message.status === "error" ? "text-red-600" : ""}`}>
            <ReactMarkdown
              components={{
                a: ({ href, children }) => {
                  const m = /^#cite-(\d+)$/.exec(href ?? "");
                  const c = m ? cites.get(Number(m[1])) : undefined;
                  if (c) {
                    return (
                      <Link
                        href={pageHref(c.source, c.page)}
                        title={`${c.source}, page ${c.page}`}
                        className="mx-0.5 inline-flex items-center rounded bg-accent-soft px-1.5 text-[11px] font-semibold text-accent-strong align-[2px] no-underline"
                      >
                        {c.n}
                      </Link>
                    );
                  }
                  return (
                    <a href={href} className="underline">
                      {children}
                    </a>
                  );
                },
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-muted">{message.status === "streaming" ? "Searching the material…" : ""}</p>
        )}
        {message.status === "streaming" && message.content && <span className="ml-1 inline-block h-4 w-1.5 animate-pulse bg-accent align-middle" aria-hidden />}

        {shown.length > 0 && (
          <div className="mt-3 border-t border-border pt-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Sources</p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {shown.map((c) => (
                <li key={c.n}>
                  <Link href={pageHref(c.source, c.page)} className="inline-flex items-center gap-1.5 rounded-md border border-border px-1.5 py-0.5 text-xs hover:border-accent">
                    <span className="font-semibold text-accent-strong">{c.n}</span>
                    <SourceBadge source={c.source} page={c.page} short />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {message.status === "done" && message.model && (
          <p className="mt-2 text-[10px] text-muted">Answered by {message.model} from retrieved pages only.</p>
        )}
      </div>
    </div>
  );
}

function chip(active: boolean) {
  return `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
    active ? "border-accent bg-accent-soft text-accent-strong" : "border-border bg-surface text-muted hover:text-foreground"
  }`;
}
