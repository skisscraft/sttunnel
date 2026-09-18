"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/manual", label: "Manual", icon: SearchIcon },
  { href: "/ask", label: "Ask", icon: ChatIcon },
  { href: "/course", label: "Course", icon: CourseIcon, soon: true },
  { href: "/troubleshoot", label: "Troubleshoot", icon: WrenchIcon, soon: true },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/manual" className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent text-white font-bold text-sm">
              TA
            </span>
            <span className="flex flex-col leading-tight min-w-0">
              <span className="font-semibold tracking-tight">TBM Academy</span>
              <span className="text-[11px] text-muted truncate">Herrenknecht Academy material · internal</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(it.href) ? "bg-accent-soft text-accent-strong" : "text-muted hover:text-foreground hover:bg-surface-2"
                }`}
              >
                {it.label}
                {it.soon && <span className="ml-1.5 text-[10px] uppercase tracking-wide text-muted">soon</span>}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-20 border-t border-border bg-surface/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Primary"
      >
        <ul className="grid grid-cols-4">
          {items.map((it) => {
            const active = isActive(it.href);
            const Icon = it.icon;
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
                    active ? "text-accent-strong" : "text-muted"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" />
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12a8 8 0 0 1-8 8H8l-4 3v-3.5A8 8 0 1 1 21 12Z" />
    </svg>
  );
}
function CourseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2Z" />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    </svg>
  );
}
function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14.7 6.3a4 4 0 0 0 5 5l-9.4 9.4a2.1 2.1 0 0 1-3-3l9.4-9.4Z" />
      <path d="M14.7 6.3 18 3l3 3-3.3 3.3" />
    </svg>
  );
}
