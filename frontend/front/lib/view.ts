import type { Course, Student, Summary } from "./types";

/** A summary joined with the course and author it references, ready to render. */
export interface CardItem {
  summary: Summary;
  course: Course;
  author: Student;
  matchPct?: number;
  reasons?: string[];
}

export function toCardItems(
  summaries: Summary[],
  courses: Course[],
  students: Student[]
): CardItem[] {
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const studentMap = new Map(students.map((s) => [s.id, s]));
  return summaries.flatMap((summary) => {
    const course = courseMap.get(summary.courseId);
    const author = studentMap.get(summary.authorId);
    if (!course || !author) return [];
    return [{ summary, course, author }];
  });
}
