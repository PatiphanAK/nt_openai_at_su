import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseById, getStudents, getSummaries } from "@/lib/data";
import { toCardItems } from "@/lib/view";
import { plural } from "@/lib/format";
import { SummaryCard } from "@/components/SummaryCard";
import { CourseTopicList } from "@/components/TopicCoverage";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[code]">): Promise<Metadata> {
  const { code } = await params;
  const course = await getCourseById(code.toUpperCase());
  return { title: course ? `${course.code}: ${course.title}` : "Course not found" };
}

export default async function CoursePage({
  params,
}: PageProps<"/courses/[code]">) {
  const { code } = await params;
  const course = await getCourseById(code.toUpperCase());
  if (!course) notFound();

  const summaries = await getSummaries({ courseId: course.id });
  const items = toCardItems(summaries, [course], await getStudents());
  const coveredTopics = course.requiredTopics.filter((topic) =>
    summaries.some((s) => s.topicsCovered.includes(topic))
  ).length;

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-line bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg bg-accent-soft px-3 py-1 text-sm font-bold tracking-wide text-accent">
            {course.code}
          </span>
          <span className="text-sm text-muted">{course.term}</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight">{course.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {course.school} · {course.instructor}
        </p>
        <p className="mt-4 max-w-3xl leading-relaxed text-muted">{course.description}</p>
        <p className="mt-4 text-sm">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {coveredTopics}/{course.requiredTopics.length}
          </span>{" "}
          <span className="text-muted">
            required topics have at least one student summary ·{" "}
            {plural(summaries.length, "summary")} shared
          </span>
        </p>
      </header>

      <section aria-label="Required topics">
        <h2 className="mb-4 text-xl font-bold tracking-tight">
          Required topics{" "}
          <span className="text-sm font-normal text-muted">— what assessments cover</span>
        </h2>
        <CourseTopicList course={course} summaries={summaries} />
      </section>

      <section aria-label="Summaries for this course">
        <h2 className="mb-4 text-xl font-bold tracking-tight">
          Student summaries for {course.code}
        </h2>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-card p-12 text-center">
            <p className="font-medium">No summaries shared for this course yet.</p>
            <p className="mt-1 text-sm text-muted">
              Be the first — share yours from the Share a summary page.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <SummaryCard key={item.summary.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
