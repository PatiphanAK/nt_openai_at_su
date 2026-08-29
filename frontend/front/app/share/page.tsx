import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCourses } from "@/lib/data";
import { ShareForm } from "@/components/ShareForm";

export const metadata: Metadata = { title: "Share a summary" };

export default async function SharePage() {
  if (!(await getCurrentUser())) redirect("/login");
  const courses = await getCourses();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Share a summary</h1>
        <p className="mt-2 leading-relaxed text-muted">
          Publish the notes you made for a class. Describe <em>how</em> you wrote
          them — format, depth, tone — and the recommender will surface them to
          students who learn best from that same style. Tagging the required
          topics you covered helps classmates check coverage before an exam.
        </p>
      </header>
      <ShareForm courses={courses} />
    </div>
  );
}
