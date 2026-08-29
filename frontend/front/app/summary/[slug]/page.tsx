import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getCourseById,
  getCourses,
  getLikedIds,
  getSavedIds,
  getStudentById,
  getStudents,
  getSummaries,
  getSummariesByAuthor,
  getSummaryBySlug,
} from "@/lib/data";
import { recommendForSummary } from "@/lib/recommend";
import { formatDate, plural } from "@/lib/format";
import { toCardItems } from "@/lib/view";
import { Avatar } from "@/components/Avatar";
import { CourseChip, MetaPill, StyleBadge } from "@/components/Badges";
import { LikeButton, SaveButton } from "@/components/Buttons";
import { RecommendRail } from "@/components/RecommendRail";
import { SummaryBody } from "@/components/SummaryBody";
import { TopicCoverage } from "@/components/TopicCoverage";

export async function generateMetadata({
  params,
}: PageProps<"/summary/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const summary = await getSummaryBySlug(slug);
  return { title: summary ? summary.title : "Summary not found" };
}

export default async function SummaryPage({
  params,
}: PageProps<"/summary/[slug]">) {
  const { slug } = await params;
  const summary = await getSummaryBySlug(slug);
  if (!summary) notFound();

  const course = await getCourseById(summary.courseId);
  if (!course) notFound();
  const author = await getStudentById(summary.authorId);
  if (!author) notFound();

  const user = await getCurrentUser();
  const [likedIds, savedIds] = user
    ? await Promise.all([getLikedIds(user.id), getSavedIds(user.id)])
    : [[], []];
  const liked = likedIds.includes(slug);
  const saved = savedIds.includes(slug);

  const recs = recommendForSummary(summary, await getSummaries(), user?.id ?? "", 4);
  const recById = new Map(recs.map((r) => [r.summary.id, r]));
  // Recommendations can reference any course/author, so join against the full
  // lists; the recommender already excludes the viewer's own summaries.
  const recItems = toCardItems(
    recs.map((r) => r.summary),
    await getCourses(),
    await getStudents()
  ).map((item) => ({
    ...item,
    matchPct: recById.get(item.summary.id)?.matchPct,
    reasons: recById.get(item.summary.id)?.reasons,
  }));

  return (
    <div className="space-y-12">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/browse" className="hover:text-accent">
          Browse
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/courses/${course.code.toLowerCase()}`} className="hover:text-accent">
          {course.code}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{summary.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <article className="min-w-0">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StyleBadge format={summary.format} />
              <MetaPill>{formatDate(summary.createdAt)}</MetaPill>
              {summary.hasExamples && <MetaPill>Examples</MetaPill>}
              {summary.hasFormulas && <MetaPill>Formulas</MetaPill>}
              {summary.hasDiagrams && <MetaPill>Diagrams</MetaPill>}
            </div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {summary.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href={`/students/${author.handle}`}
                className="flex items-center gap-2.5 text-sm font-medium transition hover:text-accent"
              >
                <Avatar name={author.name} color={author.color} />
                <span>
                  {author.name}
                  <span className="block text-xs text-muted">
                    {author.major} · Year {author.year}
                  </span>
                </span>
              </Link>
              <CourseChip code={course.code} title={course.title} />
            </div>
            <div className="flex flex-wrap gap-2.5">
              <LikeButton slug={summary.slug} likes={summary.likes} liked={liked} authed={!!user} />
              <SaveButton slug={summary.slug} saves={summary.saves} saved={saved} authed={!!user} />
            </div>
          </header>

          <hr className="my-8 border-line" />

          <SummaryBody summary={summary} />
        </article>

        <aside className="space-y-5">
          <TopicCoverage summary={summary} course={course} />
          <section className="rounded-2xl border border-line bg-card p-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
              About the author
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={author.name} color={author.color} size="lg" />
              <div>
                <p className="font-semibold">{author.name}</p>
                <p className="text-xs text-muted">
                  {author.major} · Year {author.year}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{author.bio}</p>
            <p className="mt-3 text-xs text-muted">
              {plural((await getSummariesByAuthor(author.id)).length, "summary")} shared
            </p>
            <Link
              href={`/students/${author.handle}`}
              className="mt-4 inline-block rounded-full border border-line px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
            >
              View profile
            </Link>
          </section>
        </aside>
      </div>

      <RecommendRail
        title="Same style, other students"
        subtitle="Summaries written in a similar style to this one"
        items={recItems}
      />
    </div>
  );
}
