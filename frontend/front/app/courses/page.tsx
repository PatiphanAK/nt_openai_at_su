import type { Metadata } from "next";
import { getCourses, getSummaries } from "@/lib/data";
import { CourseCard } from "@/components/CourseCard";

export const metadata: Metadata = { title: "Courses" };

export default async function CoursesPage() {
  const [summaries, courses] = await Promise.all([getSummaries(), getCourses()]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Courses</h1>
        <p className="mt-1 text-muted">
          Each course lists its required topics — the checklist your assessments
          are built on.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            summaries={summaries.filter((s) => s.courseId === course.id)}
          />
        ))}
      </div>
    </div>
  );
}
