import Link from "next/link";
import type { Course, Summary } from "@/lib/types";
import { plural } from "@/lib/format";
import { labelFormat } from "@/lib/recommend";

export function CourseCard({ course, summaries }: { course: Course; summaries: Summary[] }) {
  const count = summaries.length;
  const likeSum = summaries.reduce((sum, s) => sum + s.likes, 0);
  // Dominant format across this course's summaries.
  const topFormat = count > 0
    ? Object.entries(
        summaries.reduce<Record<string, number>>((acc, s) => {
          acc[s.format] = (acc[s.format] ?? 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  return (
    <Link
      href={`/courses/${course.code.toLowerCase()}`}
      className="group flex h-full flex-col gap-3 rounded-2xl border border-line bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-lg bg-accent-soft px-2.5 py-1 text-xs font-bold tracking-wide text-accent">
          {course.code}
        </span>
        <span className="text-xs text-muted">{course.term}</span>
      </div>
      <div>
        <h3 className="font-semibold leading-snug transition group-hover:text-accent">
          {course.title}
        </h3>
        <p className="mt-1 text-xs text-muted">
          {course.school} · {course.instructor}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-3 text-xs text-muted">
        <span className="font-medium text-foreground">{plural(count, "summary")}</span>
        <span>·</span>
        <span>{plural(course.requiredTopics.length, "required topic")}</span>
        <span>·</span>
        <span>{plural(likeSum, "like")}</span>
        {topFormat && (
          <>
            <span>·</span>
            <span>top style: {labelFormat(topFormat as Summary["format"])}</span>
          </>
        )}
      </div>
    </Link>
  );
}
