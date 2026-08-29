import type { Metadata } from "next";
import { getCourses, getStudents, getSummaries } from "@/lib/data";
import { toCardItems } from "@/lib/view";
import { FilterBar } from "@/components/FilterBar";

export const metadata: Metadata = { title: "Browse summaries" };

export default async function BrowsePage() {
  const [summaries, courses, students] = await Promise.all([
    getSummaries(),
    getCourses(),
    getStudents(),
  ]);
  const items = toCardItems(summaries, courses, students);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Browse summaries</h1>
        <p className="mt-1 text-muted">
          Every summary students have shared — filter by course or by the style you
          like to read.
        </p>
      </header>
      <FilterBar items={items} />
    </div>
  );
}
