import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Join SkillSchool</h1>
        <p className="mt-2 text-muted">
          Share your course summaries and find notes written the way you learn.
        </p>
      </header>

      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
