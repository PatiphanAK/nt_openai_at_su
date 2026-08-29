import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  getCourses,
  getLikedIds,
  getStudents,
  getSummaries,
  getStats,
} from "@/lib/data";
import { recommendForUser } from "@/lib/recommend";
import { toCardItems } from "@/lib/view";
import { plural } from "@/lib/format";
import { RecommendRail } from "@/components/RecommendRail";
import { SummaryCard } from "@/components/SummaryCard";
import { CourseCard } from "@/components/CourseCard";

const HOW_IT_WORKS = [
  {
    title: "Your style profile",
    body: "Every summary you write or like shapes a style vector — format, depth, tone, examples, diagrams.",
  },
  {
    title: "Style matching",
    body: "We score every shared summary against your profile with cosine similarity and explain the match.",
  },
  {
    title: "Aligned to requirements",
    body: "Each course lists its required topics, so you can see exactly what a summary covers before you rely on it.",
  },
];

export default async function HomePage() {
  const [user, summaries, courses, students, stats] = await Promise.all([
    getCurrentUser(),
    getSummaries(),
    getCourses(),
    getStudents(),
    getStats(),
  ]);

  // Personal rail only makes sense for a signed-in user with some signal.
  const likedIds = user ? await getLikedIds(user.id) : [];
  const recs = user ? recommendForUser(user, summaries, likedIds, 4) : [];
  const recById = new Map(recs.map((r) => [r.summary.id, r]));
  const recItems = toCardItems(
    recs.map((r) => r.summary),
    courses,
    students
  ).map((item) => ({
    ...item,
    matchPct: recById.get(item.summary.id)?.matchPct,
    reasons: recById.get(item.summary.id)?.reasons,
  }));

  const trending = [...summaries].sort((a, b) => b.likes - a.likes).slice(0, 3);
  const trendingItems = toCardItems(trending, courses, students);

  const popularCourses = [...courses]
    .sort(
      (a, b) =>
        summaries.filter((s) => s.courseId === b.id).length -
        summaries.filter((s) => s.courseId === a.id).length
    )
    .slice(0, 4);

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl border border-line bg-card px-6 py-14 text-center sm:px-12">
        <div
          aria-hidden
          className="absolute -top-24 left-1/4 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-28 right-1/5 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl"
        />
        <p className="relative mx-auto inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
          For students, by students
        </p>
        <h1 className="relative mx-auto mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          Real course summaries, matched to{" "}
          <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            your style
          </span>
          .
        </h1>
        <p className="relative mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Share what you wrote for class, discover notes in the format you learn
          from best, and check every summary against your course&apos;s required
          topics.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/browse"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-strong"
          >
            Browse summaries
          </Link>
          {user ? (
            <Link
              href="/share"
              className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold transition hover:border-accent hover:text-accent"
            >
              Share yours
            </Link>
          ) : (
            <Link
              href="/register"
              className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold transition hover:border-accent hover:text-accent"
            >
              Join free
            </Link>
          )}
        </div>
        <dl className="relative mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            [String(stats.summaryCount), "summaries"],
            [String(stats.courseCount), "courses"],
            [String(stats.studentCount), "students"],
            [String(stats.likeCount), "likes"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-line bg-background px-3 py-4">
              <dt className="order-2 text-xs text-muted">{label}</dt>
              <dd className="text-2xl font-extrabold tracking-tight">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {user && recItems.length > 0 && (
        <RecommendRail
          title="Matched to your summary style"
          subtitle={`Based on what ${user.name} wrote and liked`}
          items={recItems}
        />
      )}

      <section aria-label="Trending summaries">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3">
          <h2 className="text-xl font-bold tracking-tight">Trending this week</h2>
          <Link href="/browse" className="text-sm font-medium text-accent hover:underline">
            See all {plural(summaries.length, "summary")} →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trendingItems.map((item) => (
            <SummaryCard key={item.summary.id} item={item} />
          ))}
        </div>
      </section>

      <section aria-label="Popular courses">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3">
          <h2 className="text-xl font-bold tracking-tight">Popular courses</h2>
          <Link href="/courses" className="text-sm font-medium text-accent hover:underline">
            All courses →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              summaries={summaries.filter((s) => s.courseId === course.id)}
            />
          ))}
        </div>
      </section>

      <section aria-label="How recommendations work" className="pb-2">
        <h2 className="mb-4 text-xl font-bold tracking-tight">
          How the style recommender works
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-line bg-card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
