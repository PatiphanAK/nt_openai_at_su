import Link from "next/link";
import type { Course, Summary } from "@/lib/types";
import { plural } from "@/lib/format";
import { TopicChip } from "./Badges";

/** Checklist of the course's required topics against what a summary covers. */
export function TopicCoverage({ summary, course }: { summary: Summary; course: Course }) {
  const covered = summary.topicsCovered.length;
  const total = course.requiredTopics.length;
  const pct = total === 0 ? 0 : Math.round((covered / total) * 100);
  return (
    <section className="rounded-2xl border border-line bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-bold tracking-tight">
          {course.code} required topics
        </h2>
        <span
          className={`text-sm font-semibold ${covered === total ? "text-emerald-600 dark:text-emerald-400" : "text-accent"}`}
        >
          {covered}/{total} covered
        </span>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Topics covered"
      >
        <div
          className={`h-full rounded-full ${covered === total ? "bg-emerald-500" : "bg-accent"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {course.requiredTopics.map((topic) => (
          <TopicChip key={topic} label={topic} covered={summary.topicsCovered.includes(topic)} />
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">
        See all summaries for this course on{" "}
        <Link href={`/courses/${course.code.toLowerCase()}`} className="font-medium text-accent hover:underline">
          {plural(total, "required topic")}
        </Link>{" "}
        · course page
      </p>
    </section>
  );
}

/** Compact per-topic coverage counts for a whole course page. */
export function CourseTopicList({
  course,
  summaries,
}: {
  course: Course;
  summaries: Summary[];
}) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {course.requiredTopics.map((topic) => {
        const count = summaries.filter((s) => s.topicsCovered.includes(topic)).length;
        return (
          <li
            key={topic}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-2.5 text-sm"
          >
            <span className="truncate">{topic}</span>
            {count > 0 ? (
              <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
                {plural(count, "summary")}
              </span>
            ) : (
              <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-xs text-muted">
                uncovered
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
