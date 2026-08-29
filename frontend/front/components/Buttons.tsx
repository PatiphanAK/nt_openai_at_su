"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { likeSummaryAction, saveSummaryAction } from "@/lib/actions";

export function LikeButton({
  slug,
  likes,
  liked,
  authed,
}: {
  slug: string;
  likes: number;
  liked: boolean;
  authed: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState({ likes, liked });
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    if (!authed) {
      router.push("/login");
      return;
    }
    setState((s) => ({ likes: s.likes + (s.liked ? -1 : 1), liked: !s.liked }));
    startTransition(() => {
      likeSummaryAction(slug);
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={state.liked}
      title={authed ? undefined : "Log in to like"}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
        state.liked
          ? "border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-300"
          : "border-line text-foreground hover:border-rose-300 hover:text-rose-500"
      }`}
    >
      <svg
        viewBox="0 0 20 20"
        className={`h-4 w-4 ${state.liked ? "fill-rose-500" : "fill-current"}`}
        aria-hidden
      >
        <path d="M10 17s-6.5-4.1-8.4-8C.3 6.2 2 3.4 4.9 3.4c1.7 0 3 .9 3.9 2.1l1.2 1.6 1.2-1.6c.9-1.2 2.2-2.1 3.9-2.1 2.9 0 4.6 2.8 3.3 5.6-1.9 3.9-8.4 8-8.4 8z" />
      </svg>
      {state.likes}
    </button>
  );
}

export function SaveButton({
  slug,
  saves,
  saved,
  authed,
}: {
  slug: string;
  saves: number;
  saved: boolean;
  authed: boolean;
}) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(saved);
  const [count, setCount] = useState(saves);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    if (!authed) {
      router.push("/login");
      return;
    }
    setIsSaved((s) => !s);
    setCount((c) => c + (isSaved ? -1 : 1));
    startTransition(() => {
      saveSummaryAction(slug);
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={isSaved}
      title={authed ? (isSaved ? "Saved to your library" : "Save to your library") : "Log in to save"}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
        isSaved
          ? "border-accent bg-accent-soft text-accent"
          : "border-line text-foreground hover:border-accent hover:text-accent"
      }`}
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M5 2h10a1 1 0 011 1v15l-6-4-6 4V3a1 1 0 011-1z" />
      </svg>
      {isSaved ? "Saved" : "Save"}
      <span className="text-xs font-normal opacity-70">{count}</span>
    </button>
  );
}
