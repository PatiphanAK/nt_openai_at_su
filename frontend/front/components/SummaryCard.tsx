import Link from "next/link";
import type { CardItem } from "@/lib/view";
import type { Summary } from "@/lib/types";
import { formatDate, plural } from "@/lib/format";
import { Avatar } from "./Avatar";
import { CourseChip, MatchBadge, StyleBadge } from "./Badges";

export type { CardItem };

function snippet(summary: Summary): string {
  const first = summary.sections[0]?.body ?? "";
  const line = first
    .split("\n")
    .map((l) => l.replace(/^- |> /, "").trim())
    .find((l) => l.length > 0);
  return (line ?? "").slice(0, 110);
}

export function SummaryCard({ item }: { item: CardItem }) {
  const { summary, course, author, matchPct, reasons } = item;
  return (
    <article className="group flex h-full flex-col gap-3 rounded-2xl border border-line bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <StyleBadge format={summary.format} />
        <MatchBadge pct={matchPct ?? 0} />
        <span className="ml-auto text-xs text-muted">{formatDate(summary.createdAt)}</span>
      </div>

      <Link href={`/summary/${summary.slug}`} className="rounded-sm">
        <h3 className="font-semibold leading-snug transition group-hover:text-accent">
          {summary.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{snippet(summary)}</p>
      </Link>

      {reasons && reasons.length > 0 && (
        <p className="text-xs text-accent">{reasons.join(" · ")}</p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-3 text-xs text-muted">
        <Link
          href={`/students/${author.handle}`}
          className="flex items-center gap-2 font-medium text-foreground transition hover:text-accent"
        >
          <Avatar name={author.name} color={author.color} size="sm" />
          {author.name}
        </Link>
        <CourseChip code={course.code} title={course.title} />
        <span className="ml-auto inline-flex items-center gap-1" title="Likes">
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-rose-400" aria-hidden>
            <path d="M10 17s-6.5-4.1-8.4-8C.3 6.2 2 3.4 4.9 3.4c1.7 0 3 .9 3.9 2.1l1.2 1.6 1.2-1.6c.9-1.2 2.2-2.1 3.9-2.1 2.9 0 4.6 2.8 3.3 5.6-1.9 3.9-8.4 8-8.4 8z" />
          </svg>
          {plural(summary.likes, "like")}
        </span>
        <span className="inline-flex items-center gap-1" title="Required topics covered">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-emerald-500" aria-hidden>
            <path d="M6.5 11l-2.8-2.8L2.6 9.3l3.9 3.9 7-7-1.1-1.1L6.5 11z" />
          </svg>
          {summary.topicsCovered.length}/{course.requiredTopics.length} topics
        </span>
      </div>
    </article>
  );
}
