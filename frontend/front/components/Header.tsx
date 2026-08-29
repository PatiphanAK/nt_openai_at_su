import Link from "next/link";
import { NavLinks } from "./NavLinks";
import { Avatar } from "./Avatar";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-sm">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm">
        <svg viewBox="0 0 20 20" className="h-4.5 w-4.5 fill-current" aria-hidden>
          <path d="M10 2L1 6.5l9 4.5 7.5-3.75V13H19V6.5L10 2zM4 10.9V14c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-3.1l-6 3-6-3z" />
        </svg>
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        Skill<span className="text-accent">School</span>
      </span>
    </Link>
  );
}

export async function Header() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <div className="mx-auto">
          <NavLinks />
        </div>
        <div className="ml-auto flex items-center gap-2.5 md:ml-0">
          {user ? (
            <>
              <Link
                href="/share"
                className="hidden rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-strong sm:block"
              >
                Share a summary
              </Link>
              <Link
                href={`/students/${user.handle}`}
                className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 transition hover:border-accent"
                title="Your profile"
              >
                <Avatar name={user.name} color={user.color} size="sm" />
                <span className="hidden text-sm font-medium lg:block">{user.name}</span>
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:border-rose-300 hover:text-rose-500"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-line px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-strong"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
