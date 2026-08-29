export type SummaryFormat =
  | "outline"
  | "bullets"
  | "narrative"
  | "qa"
  | "mindmap"
  | "flashcards";

export type SummaryDepth = "quick-review" | "standard" | "deep-dive";

export type SummaryTone = "concise" | "friendly" | "academic";

export interface Student {
  id: string;
  handle: string; // used in URL: /students/[handle]
  name: string;
  major: string;
  year: number;
  color: string; // avatar gradient classes
  bio: string;
}

export interface Course {
  id: string; // same as code, e.g. "CS201"
  code: string; // e.g. "CS201"
  title: string;
  school: string;
  instructor: string;
  term: string;
  description: string;
  requiredTopics: string[];
}

export interface SummarySection {
  heading: string;
  /**
   * Plain text, one item per line. Renderers interpret line conventions:
   *  "- "  bullet (two-space indent = nested)
   *  "Q: " / "A: "  question/answer pair (qa + flashcards)
   *  "> "  tip / callout
   */
  body: string;
}

export interface Summary {
  id: string; // same as slug, used in URL: /summary/[slug]
  slug: string;
  title: string;
  courseId: string;
  authorId: string;
  createdAt: string; // ISO date
  format: SummaryFormat;
  depth: SummaryDepth;
  tone: SummaryTone;
  hasExamples: boolean;
  hasFormulas: boolean;
  hasDiagrams: boolean;
  topicsCovered: string[]; // subset of course.requiredTopics
  likes: number;
  saves: number;
  sections: SummarySection[];
}

/** Fields that define a summary's "style" — the basis of recommendations. */
export type StyleFields = Pick<
  Summary,
  | "format"
  | "depth"
  | "tone"
  | "hasExamples"
  | "hasFormulas"
  | "hasDiagrams"
>;

export interface Recommendation {
  summary: Summary;
  matchPct: number;
  reasons: string[];
}

export interface StudentMatch {
  student: Student;
  matchPct: number;
}
