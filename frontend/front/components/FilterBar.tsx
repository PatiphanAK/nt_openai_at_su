"use client";

import { useMemo, useState } from "react";
import type { SummaryFormat } from "@/lib/types";
import { labelFormat } from "@/lib/recommend";
import type { CardItem } from "./SummaryCard";
import { SummaryCard } from "./SummaryCard";

const FORMATS: SummaryFormat[] = ["outline", "bullets", "narrative", "qa", "mindmap", "flashcards"];

type SortKey = "top" | "new";

export function FilterBar({ items }: { items: CardItem[] }) {
  const [query, setQuery] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [format, setFormat] = useState<"all" | SummaryFormat>("all");
  const [sort, setSort] = useState<SortKey>("top");

  const courses = useMemo(
    () => Array.from(new Map(items.map((i) => [i.course.id, i.course])).values()),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = items.filter((item) => {
      if (courseId !== "all" && item.course.id !== courseId) return false;
      if (format !== "all" && item.summary.format !== format) return false;
      if (q.length > 0) {
        const haystack = [
          item.summary.title,
          item.course.title,
          item.course.code,
          item.author.name,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    return result.sort((a, b) =>
      sort === "top"
        ? b.summary.likes - a.summary.likes
        : b.summary.createdAt.localeCompare(a.summary.createdAt)
    );
  }, [items, query, courseId, format, sort]);

  const selectCls =
    "rounded-full border border-line bg-card px-3.5 py-2 text-sm text-foreground focus:border-accent focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-52 flex-1">
          <svg
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 fill-muted"
            aria-hidden
          >
            <path d="M8.5 3a5.5 5.5 0 014.4 8.8l3.4 3.4a1 1 0 01-1.4 1.4l-3.4-3.4A5.5 5.5 0 118.5 3zm0 2a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search summaries, courses, students…"
            aria-label="Search summaries"
            className="w-full rounded-full border border-line bg-card py-2 pl-10 pr-4 text-sm focus:border-accent focus:outline-none"
          />
        </div>

        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} aria-label="Filter by course" className={selectCls}>
          <option value="all">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.title}
            </option>
          ))}
        </select>

        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as "all" | SummaryFormat)}
          aria-label="Filter by style"
          className={selectCls}
        >
          <option value="all">All styles</option>
          {FORMATS.map((f) => (
            <option key={f} value={f}>
              {labelFormat(f)}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort"
          className={selectCls}
        >
          <option value="top">Most liked</option>
          <option value="new">Newest</option>
        </select>
      </div>

      <p className="text-sm text-muted" role="status">
        {filtered.length} {filtered.length === 1 ? "summary" : "summaries"}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-card p-12 text-center">
          <p className="font-medium">No summaries match those filters.</p>
          <p className="mt-1 text-sm text-muted">Try clearing the search or widening the course filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <SummaryCard key={item.summary.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
