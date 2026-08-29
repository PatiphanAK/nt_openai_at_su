import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-muted">
          Log in to share summaries, like, save, and get style-matched picks.
        </p>
      </header>

      <div className="rounded-2xl border border-line bg-card p-6 shadow-sm">
        <AuthForm mode="login" />
      </div>

      <div className="rounded-2xl border border-dashed border-line bg-card px-5 py-4 text-center text-sm text-muted">
        <p className="font-semibold text-foreground">Demo account</p>
        <p className="mt-1">
          <code className="rounded bg-accent-soft px-1.5 py-0.5 text-accent">pat@skillschool.demo</code>{" "}
          · password{" "}
          <code className="rounded bg-accent-soft px-1.5 py-0.5 text-accent">password123</code>
        </p>
        <p className="mt-1 text-xs">Every seeded student uses the same password.</p>
      </div>
    </div>
  );
}
