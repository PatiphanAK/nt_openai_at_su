"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, type AuthFormState } from "@/lib/actions";

const inputCls =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    isRegister ? registerAction : loginAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p
          role="alert"
          className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-300"
        >
          {state.error}
        </p>
      )}

      {isRegister && (
        <>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Name</span>
            <input type="text" name="name" required minLength={2} placeholder="Pat" className={inputCls} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Major</span>
              <input type="text" name="major" placeholder="Computer Science" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Year</span>
              <select name="year" defaultValue="1" className={inputCls}>
                {[1, 2, 3, 4, 5].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Email</span>
        <input type="email" name="email" required placeholder="you@school.edu" className={inputCls} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Password</span>
        <input
          type="password"
          name="password"
          required
          minLength={isRegister ? 6 : undefined}
          placeholder="••••••••"
          className={inputCls}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-strong disabled:opacity-60"
      >
        {pending ? "…" : isRegister ? "Create account" : "Log in"}
      </button>

      <p className="text-center text-sm text-muted">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/register" className="font-medium text-accent hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
