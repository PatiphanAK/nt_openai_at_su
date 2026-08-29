import { prisma } from "./prisma";
import { toStudent } from "./auth";
import type { Course, Student, Summary, SummarySection } from "./types";

/**
 * Data access for pages and actions — replaces the old in-memory mock store.
 * Every query maps Prisma rows into the app-facing shapes in lib/types.ts so
 * components and the recommender don't know about the ORM.
 */

// ---------- row -> app-type mappers ----------

type UserRow = {
  id: string;
  handle: string;
  name: string;
  major: string;
  year: number;
  color: string;
  bio: string;
};

type CourseRow = {
  id: string;
  code: string;
  title: string;
  school: string;
  instructor: string;
  term: string;
  description: string;
  requiredTopics: string[];
};

type SummaryRow = {
  id: string;
  slug: string;
  title: string;
  course_id: string;
  author_id: string;
  created_at: Date;
  format: string;
  depth: string;
  tone: string;
  hasExamples: boolean;
  hasFormulas: boolean;
  hasDiagrams: boolean;
  topicsCovered: string[];
  sections: unknown;
  baseLikes: number;
  baseSaves: number;
  author?: UserRow | null;
  course?: CourseRow | null;
  _count?: { likes: number; saves: number };
};

function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    school: row.school,
    instructor: row.instructor,
    term: row.term,
    description: row.description,
    requiredTopics: row.requiredTopics,
  };
}

function mapSummary(row: SummaryRow): Summary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    courseId: row.course_id,
    authorId: row.author_id,
    createdAt: row.created_at.toISOString().slice(0, 10),
    format: row.format as Summary["format"],
    depth: row.depth as Summary["depth"],
    tone: row.tone as Summary["tone"],
    hasExamples: row.hasExamples,
    hasFormulas: row.hasFormulas,
    hasDiagrams: row.hasDiagrams,
    topicsCovered: row.topicsCovered,
    sections: (row.sections ?? []) as SummarySection[],
    // Displayed counts = seeded historical base + real user rows from the DB.
    likes: row.baseLikes + (row._count?.likes ?? 0),
    saves: row.baseSaves + (row._count?.saves ?? 0),
  };
}

// ---------- summary queries ----------

const summaryInclude = {
  author: {
    select: {
      id: true,
      handle: true,
      name: true,
      major: true,
      year: true,
      color: true,
      bio: true,
    },
  },
  course: true,
  _count: { select: { likes: true, saves: true } },
} as const;

export async function getSummaries(options?: {
  authorId?: string;
  courseId?: string;
}): Promise<Summary[]> {
  const rows = await prisma.summary.findMany({
    where: {
      ...(options?.authorId ? { author_id: options.authorId } : {}),
      ...(options?.courseId ? { course_id: options.courseId } : {}),
    },
    include: summaryInclude,
    orderBy: { created_at: "desc" },
  });
  return rows.map(mapSummary);
}

export async function getSummariesByAuthor(authorId: string): Promise<Summary[]> {
  return getSummaries({ authorId });
}

export async function getSummariesByCourse(courseId: string): Promise<Summary[]> {
  return getSummaries({ courseId });
}

export async function getSummaryBySlug(slug: string): Promise<Summary | undefined> {
  const row = await prisma.summary.findUnique({ where: { slug }, include: summaryInclude });
  return row ? mapSummary(row) : undefined;
}

export async function getLikedIds(userId: string): Promise<string[]> {
  const rows = await prisma.like.findMany({
    where: { user_id: userId },
    select: { summary_id: true },
  });
  return rows.map((r) => r.summary_id);
}

export async function getSavedIds(userId: string): Promise<string[]> {
  const rows = await prisma.save.findMany({
    where: { user_id: userId },
    select: { summary_id: true },
  });
  return rows.map((r) => r.summary_id);
}

/** Likes across all users, keyed by user id — feeds the recommender's taste profiles. */
export async function getLikedIdsByUser(): Promise<Map<string, string[]>> {
  const rows = await prisma.like.findMany({ select: { user_id: true, summary_id: true } });
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const list = map.get(row.user_id) ?? [];
    list.push(row.summary_id);
    map.set(row.user_id, list);
  }
  return map;
}

// ---------- course / student / misc queries ----------

export async function getCourses(): Promise<Course[]> {
  const rows = await prisma.course.findMany({ orderBy: { code: "asc" } });
  return rows.map(mapCourse);
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  const row = await prisma.course.findUnique({ where: { id } });
  return row ? mapCourse(row) : undefined;
}

export async function getStudents(): Promise<Student[]> {
  const rows = await prisma.user.findMany({ orderBy: { created_at: "asc" } });
  return rows.map(toStudent);
}

export async function getStudentByHandle(handle: string): Promise<Student | undefined> {
  const row = await prisma.user.findUnique({ where: { handle } });
  return row ? toStudent(row) : undefined;
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  const row = await prisma.user.findUnique({ where: { id } });
  return row ? toStudent(row) : undefined;
}

export async function getStats() {
  const [summaryCount, courseCount, studentCount, baseLikesAgg, likeRows] = await Promise.all([
    prisma.summary.count(),
    prisma.course.count(),
    prisma.user.count(),
    prisma.summary.aggregate({ _sum: { baseLikes: true } }),
    prisma.like.count(),
  ]);
  return {
    summaryCount,
    courseCount,
    studentCount,
    likeCount: (baseLikesAgg._sum.baseLikes ?? 0) + likeRows,
  };
}

// ---------- mutations ----------

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "summary"
  );
}

export interface NewSummaryInput {
  title: string;
  courseId: string;
  format: Summary["format"];
  depth: Summary["depth"];
  tone: Summary["tone"];
  hasExamples: boolean;
  hasFormulas: boolean;
  hasDiagrams: boolean;
  topicsCovered: string[];
  sections: { heading: string; body: string }[];
}

export async function createSummary(input: NewSummaryInput, authorId: string): Promise<Summary> {
  const base = slugify(input.title);
  let slug = base;
  let i = 2;
  while (await prisma.summary.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${i++}`;
  }

  const row = await prisma.summary.create({
    data: {
      id: crypto.randomUUID(),
      slug,
      title: input.title.trim(),
      course_id: input.courseId,
      author_id: authorId,
      format: input.format,
      depth: input.depth,
      tone: input.tone,
      hasExamples: input.hasExamples,
      hasFormulas: input.hasFormulas,
      hasDiagrams: input.hasDiagrams,
      topicsCovered: input.topicsCovered,
      sections: input.sections,
    },
    include: summaryInclude,
  });
  return mapSummary(row);
}

/** Creates or deletes the like row; returns whether the summary is now liked. */
export async function toggleLike(userId: string, summaryId: string): Promise<boolean> {
  const key = { user_id_summary_id: { user_id: userId, summary_id: summaryId } };
  const existing = await prisma.like.findUnique({ where: { user_id_summary_id: key.user_id_summary_id } });
  if (existing) {
    await prisma.like.delete({ where: { user_id_summary_id: key.user_id_summary_id } });
    return false;
  }
  await prisma.like.create({ data: { user_id: userId, summary_id: summaryId } });
  return true;
}

/** Creates or deletes the save row; returns whether the summary is now saved. */
export async function toggleSave(userId: string, summaryId: string): Promise<boolean> {
  const existing = await prisma.save.findUnique({
    where: { user_id_summary_id: { user_id: userId, summary_id: summaryId } },
  });
  if (existing) {
    await prisma.save.delete({
      where: { user_id_summary_id: { user_id: userId, summary_id: summaryId } },
    });
    return false;
  }
  await prisma.save.create({ data: { user_id: userId, summary_id: summaryId } });
  return true;
}
