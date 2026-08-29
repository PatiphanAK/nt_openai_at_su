import Link from "next/link";
import type { SummaryFormat } from "@/lib/types";
import { labelFormat } from "@/lib/recommend";

const FORMAT_STYLES: Record<SummaryFormat, string> = {
  outline: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  bullets: "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300",
  narrative: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  qa: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  mindmap: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  flashcards: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
};

export function StyleBadge({ format }: { format: SummaryFormat }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${FORMAT_STYLES[format]}`}
    >
      {labelFormat(format)}
    </span>
  );
}

export function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
      {children}
    </span>
  );
}

export function MatchBadge({ pct }: { pct: number }) {
  if (pct <= 0) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
      <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current" aria-hidden>
        <path d="M8 1l1.9 4.1 4.6.5-3.4 3.1.9 4.5L8 11l-4 2.2.9-4.5L1.5 5.6l4.6-.5L8 1z" />
      </svg>
      {pct}% style match
    </span>
  );
}

export function CourseChip({
  code,
  title,
  className = "",
}: {
  code: string;
  title?: string;
  className?: string;
}) {
  return (
    <Link
      href={`/courses/${code.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent transition hover:opacity-80 ${className}`}
      title={title ?? code}
    >
      <svg viewBox="0 0 20 20" className="h-3 w-3 fill-current" aria-hidden>
        <path d="M10 2L1 6.5l9 4.5 7.5-3.75V13H19V6.5L10 2zM4 10.9V14c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-3.1l-6 3-6-3z" />
      </svg>
      {code}
    </Link>
  );
}

export function TopicChip({ label, covered }: { label: string; covered?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${
        covered
          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300"
          : "border-line text-muted"
      }`}
    >
      {covered !== undefined && (
        <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
          {covered ? (
            <path
              d="M6.5 11l-2.8-2.8L2.6 9.3l3.9 3.9 7-7-1.1-1.1L6.5 11z"
              className="fill-current"
            />
          ) : (
            <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          )}
        </svg>
      )}
      {label}
    </span>
  );
}
