import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <p className="text-6xl font-extrabold tracking-tight text-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        This page didn&apos;t make the reading list
      </h1>
      <p className="mt-2 max-w-md text-muted">
        The summary, course, or student you&apos;re looking for doesn&apos;t
        exist — it may have been renamed, or the link is off by a letter.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong"
        >
          Back home
        </Link>
        <Link
          href="/browse"
          className="rounded-full border border-line px-6 py-2.5 text-sm font-semibold transition hover:border-accent hover:text-accent"
        >
          Browse summaries
        </Link>
      </div>
    </div>
  );
}
