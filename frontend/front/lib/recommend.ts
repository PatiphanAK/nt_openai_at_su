import type {
  Recommendation,
  Student,
  StudentMatch,
  StyleFields,
  Summary,
  SummaryFormat,
  SummaryTone,
} from "./types";

/**
 * Demo recommender.
 *
 * Every summary gets a numeric style vector (one-hot blocks for format,
 * depth, tone plus boolean features). Similarity = cosine over vectors.
 * When the real backend arrives, replace scoreSummaries with model/API calls —
 * the shape of `Recommendation` is designed to stay.
 */

const FORMATS: SummaryFormat[] = [
  "outline",
  "bullets",
  "narrative",
  "qa",
  "mindmap",
  "flashcards",
];

const DEPTHS = ["quick-review", "standard", "deep-dive"] as const;
const TONES: SummaryTone[] = ["concise", "friendly", "academic"];

export function styleVector(s: StyleFields): number[] {
  return [
    ...FORMATS.map((f) => (s.format === f ? 1 : 0)),
    ...DEPTHS.map((d) => (s.depth === d ? 1 : 0)),
    ...TONES.map((t) => (s.tone === t ? 1 : 0)),
    s.hasExamples ? 1 : 0,
    s.hasFormulas ? 1 : 0,
    s.hasDiagrams ? 1 : 0,
  ];
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function scoreSummaries(
  taste: number[],
  summaries: Summary[],
  excludeIds: Iterable<string>,
  demoUserId: string
): Recommendation[] {
  const exclude = new Set(excludeIds);
  return summaries
    .filter((s) => !exclude.has(s.id) && s.authorId !== demoUserId)
    .map((s) => {
      const raw = cosine(taste, styleVector(s));
      return { summary: s, raw };
    })
    .map(({ summary, raw }) => ({
      summary,
      matchPct: Math.max(4, Math.round(raw * 100)),
      reasons: buildReasons(taste, summary),
    }))
    .sort((a, b) => b.matchPct - a.matchPct || b.summary.likes - a.summary.likes);
}

function argmaxIdx(v: number[], start: number, len: number): number {
  let best = start;
  for (let i = start + 1; i < start + len; i++) {
    if (v[i] > v[best]) best = i;
  }
  return best;
}

function buildReasons(taste: number[], summary: Summary): string[] {
  const reasons: string[] = [];
  // The taste vector is a weighted mean, so blocks hold fractional values —
  // compare against each block's dominant entry rather than exact 1s.
  if (argmaxIdx(taste, 0, FORMATS.length) === FORMATS.indexOf(summary.format)) {
    reasons.push(`Same format: ${labelFormat(summary.format)}`);
  }
  const depthStart = FORMATS.length;
  if (argmaxIdx(taste, depthStart, DEPTHS.length) === depthStart + DEPTHS.indexOf(summary.depth)) {
    reasons.push(`Similar depth: ${labelDepth(summary.depth)}`);
  }
  const toneStart = depthStart + DEPTHS.length;
  if (argmaxIdx(taste, toneStart, TONES.length) === toneStart + TONES.indexOf(summary.tone)) {
    reasons.push(`Similar tone: ${labelTone(summary.tone)}`);
  }
  const featureStart = toneStart + TONES.length;
  if (taste[featureStart] > 0.5 && summary.hasExamples) {
    reasons.push("Has worked examples");
  }
  if (taste[featureStart + 2] > 0.5 && summary.hasDiagrams) {
    reasons.push("Uses diagrams");
  }
  return reasons.slice(0, 3);
}

// ---------- labels (shared with UI badges) ----------

export function labelFormat(f: SummaryFormat): string {
  return {
    outline: "Outline",
    bullets: "Bullet notes",
    narrative: "Story notes",
    qa: "Q&A sheet",
    mindmap: "Mind map",
    flashcards: "Flashcards",
  }[f];
}

export function labelDepth(d: Summary["depth"]): string {
  return { "quick-review": "Quick review", standard: "Standard", "deep-dive": "Deep dive" }[d];
}

export function labelTone(t: SummaryTone): string {
  return { concise: "Concise", friendly: "Friendly", academic: "Academic" }[t];
}

// ---------- public API ----------

/** Other summaries in a similar style to the given one ("same style" rails). */
export function recommendForSummary(
  target: Summary,
  allSummaries: Summary[],
  demoUserId: string,
  limit = 4
): Recommendation[] {
  const taste = styleVector(target);
  const recs = scoreSummaries(taste, allSummaries, new Set([target.id]), demoUserId);

  // Style match is the primary signal; a same-course bonus (15 points) lifts
  // notes for the course you're actually revising above near-ties elsewhere.
  recs.sort((a, b) => {
    const ac = a.summary.courseId === target.courseId ? a.matchPct + 15 : a.matchPct;
    const bc = b.summary.courseId === target.courseId ? b.matchPct + 15 : b.matchPct;
    return bc - ac || b.summary.likes - a.summary.likes;
  });

  const top = recs.slice(0, limit);

  // Style is the primary signal, but a student revising this course should
  // always see at least one same-course note — reserve the last slot for the
  // best same-course candidate when none made the cut.
  if (!top.some((r) => r.summary.courseId === target.courseId)) {
    const bestSameCourse = recs
      .slice(limit)
      .find((r) => r.summary.courseId === target.courseId);
    if (bestSameCourse) top[limit - 1] = bestSameCourse;
  }

  const withReasons = top.map((r) => ({
    ...r,
    reasons:
      r.summary.courseId === target.courseId
        ? ["Same course", ...r.reasons].slice(0, 3)
        : r.reasons,
  }));

  // Fallback: popular picks if the style space is thin.
  if (top.length < limit) {
    const picked = new Set(top.map((r) => r.summary.id));
    const fallback = allSummaries
      .filter((s) => s.id !== target.id && s.authorId !== demoUserId && !picked.has(s.id))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, limit - top.length)
      .map<Recommendation>((s) => ({ summary: s, matchPct: 0, reasons: ["Trending on SkillSchool"] }));
    return [...withReasons, ...fallback];
  }
  return withReasons;
}

/** Taste profile = weighted mean vector of the student's uploads (x2) + likes (x1). */
export function tasteProfile(
  student: Student,
  allSummaries: Summary[],
  likedIds: string[]
): number[] | null {
  const authored = allSummaries.filter((s) => s.authorId === student.id);
  const liked = allSummaries.filter((s) => likedIds.includes(s.id));
  const vectors = [
    ...authored.map((s) => ({ v: styleVector(s), w: 2 })),
    ...liked.map((s) => ({ v: styleVector(s), w: 1 })),
  ];
  if (vectors.length === 0) return null;
  const dim = vectors[0].v.length;
  const mean = new Array<number>(dim).fill(0);
  for (const { v, w } of vectors) {
    for (let i = 0; i < dim; i++) mean[i] += v[i] * w;
  }
  return mean.map((x) => x / vectors.length);
}

/** "Matched to your style" — recommendations for the demo user. */
export function recommendForUser(
  student: Student,
  allSummaries: Summary[],
  likedIds: string[],
  limit = 4
): Recommendation[] {
  const taste = tasteProfile(student, allSummaries, likedIds);
  if (!taste) return [];

  const recs = scoreSummaries(taste, allSummaries, new Set(likedIds), student.id);
  const top = recs
    .slice(0, limit)
    .map((r) => ({
      ...r,
      reasons: r.reasons.length > 0 ? r.reasons : ["Popular with students like you"],
    }));

  if (top.length < limit) {
    const picked = new Set(top.map((r) => r.summary.id));
    const fallback = allSummaries
      .filter((s) => s.authorId !== student.id && !likedIds.includes(s.id) && !picked.has(s.id))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, limit - top.length)
      .map<Recommendation>((s) => ({ summary: s, matchPct: 0, reasons: ["Trending on SkillSchool"] }));
    return [...top, ...fallback];
  }
  return top;
}

/** Students whose writing style is closest to this student's. */
export function similarStudents(
  student: Student,
  allStudents: Student[],
  allSummaries: Summary[],
  likedIdsByUser: Map<string, string[]>,
  limit = 4
): StudentMatch[] {
  const mine = tasteProfile(student, allSummaries, likedIdsByUser.get(student.id) ?? []);
  if (!mine) return [];
  return allStudents
    .filter((s) => s.id !== student.id)
    .map((other) => {
      const theirs = tasteProfile(other, allSummaries, likedIdsByUser.get(other.id) ?? []);
      const matchPct =
        theirs === null
          ? 0
          : Math.max(4, Math.round(cosine(mine, theirs) * 100));
      return { student: other, matchPct };
    })
    .filter((m) => m.matchPct > 0)
    .sort((a, b) => b.matchPct - a.matchPct)
    .slice(0, limit);
}
