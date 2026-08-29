import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getCourses,
  getLikedIds,
  getLikedIdsByUser,
  getStudentByHandle,
  getStudents,
  getSummaries,
  getSummariesByAuthor,
} from "@/lib/data";
import { recommendForUser, similarStudents } from "@/lib/recommend";
import { plural } from "@/lib/format";
import { toCardItems } from "@/lib/view";
import type { SummaryFormat } from "@/lib/types";
import { Avatar } from "@/components/Avatar";
import { MatchBadge, StyleBadge } from "@/components/Badges";
import { RecommendRail } from "@/components/RecommendRail";
import { SummaryCard } from "@/components/SummaryCard";

export async function generateMetadata({
  params,
}: PageProps<"/students/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const student = await getStudentByHandle(handle);
  return { title: student ? student.name : "Student not found" };
}

export default async function StudentPage({
  params,
}: PageProps<"/students/[handle]">) {
  const { handle } = await params;
  const student = await getStudentByHandle(handle);
  if (!student) notFound();

  const viewer = await getCurrentUser();
  const isOwnProfile = viewer?.id === student.id;

  const [allSummaries, allStudents, courses, likedIdsByUser] = await Promise.all([
    getSummaries(),
    getStudents(),
    getCourses(),
    getLikedIdsByUser(),
  ]);

  const summaries = await getSummariesByAuthor(student.id);
  const items = toCardItems(summaries, courses, allStudents);
  const totalLikes = summaries.reduce((sum, s) => sum + s.likes, 0);
  const similar = similarStudents(student, allStudents, allSummaries, likedIdsByUser, 4);

  // Dominant formats across this student's uploads (their "style fingerprint").
  const topFormats = Object.entries(
    summaries.reduce<Record<string, number>>((acc, s) => {
      acc[s.format] = (acc[s.format] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([format]) => format);

  const recs = isOwnProfile
    ? recommendForUser(student, allSummaries, await getLikedIds(student.id), 4)
    : [];
  const recById = new Map(recs.map((r) => [r.summary.id, r]));
  const recItems = toCardItems(
    recs.map((r) => r.summary),
    courses,
    allStudents
  ).map((item) => ({
    ...item,
    matchPct: recById.get(item.summary.id)?.matchPct,
    reasons: recById.get(item.summary.id)?.reasons,
  }));

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-5 rounded-3xl border border-line bg-card p-6 sm:flex-row sm:items-start sm:p-8">
        <Avatar name={student.name} color={student.color} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight">{student.name}</h1>
            <span className="text-sm text-muted">@{student.handle}</span>
            {isOwnProfile && (
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                you
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted">
            {student.major} · Year {student.year}
          </p>
          {student.bio && (
            <p className="mt-3 max-w-2xl leading-relaxed text-muted">{student.bio}</p>
          )}
          {topFormats.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                Writes in
              </span>
              {topFormats.map((format) => (
                <StyleBadge key={format} format={format as SummaryFormat} />
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-5 text-sm">
            <span>
              <strong className="font-bold">{summaries.length}</strong>{" "}
              <span className="text-muted">{plural(summaries.length, "summary")}</span>
            </span>
            <span>
              <strong className="font-bold">{totalLikes}</strong>{" "}
              <span className="text-muted">likes received</span>
            </span>
          </div>
        </div>
      </header>

      {isOwnProfile && recItems.length > 0 && (
        <RecommendRail
          title="Matched to your summary style"
          subtitle="From your uploads and likes"
          items={recItems}
        />
      )}

      <section aria-label={`Summaries by ${student.name}`}>
        <h2 className="mb-4 text-xl font-bold tracking-tight">
          Summaries by {isOwnProfile ? "you" : student.name}
        </h2>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-card p-12 text-center">
            <p className="font-medium">Nothing shared yet.</p>
            {isOwnProfile && (
              <Link
                href="/share"
                className="mt-4 inline-block rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
              >
                Share your first summary
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <SummaryCard key={item.summary.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {similar.length > 0 && (
        <section aria-label="Students with a similar style">
          <h2 className="mb-4 text-xl font-bold tracking-tight">
            Students with a similar style
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map(({ student: other, matchPct }) => (
              <Link
                key={other.id}
                href={`/students/${other.handle}`}
                className="group flex items-center gap-3 rounded-2xl border border-line bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Avatar name={other.name} color={other.color} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold transition group-hover:text-accent">
                    {other.name}
                  </p>
                  <p className="truncate text-xs text-muted">{other.major}</p>
                </div>
                <span className="ml-auto">
                  <MatchBadge pct={matchPct} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
