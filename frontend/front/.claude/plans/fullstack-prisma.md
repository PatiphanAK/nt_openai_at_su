# SkillSchool → full-stack Next.js (Prisma + Supabase), Vercel-ready

## Context

The repo currently has a Go/Fiber auth API (`/Volumes/DATA2/nt_openai_su/backend/`) against **Supabase Postgres** (GORM-managed `users` table: id varchar(36), email unique, name, password bcrypt, created_at, updated_at; JWT HS256 with `sub` + 72h expiry from `JWT_SECRET`). The user wants: delete the Go app, make the existing Next.js demo (`frontend/front`) full-stack on **the same DB** with **Prisma**, deployable on **Vercel**. DB is reachable from this machine (both pooler ports 5432/6543 verified).

## Architecture

**Prisma setup** (`prisma/schema.prisma`, `lib/prisma.ts`)
- `DATABASE_URL` = existing pooler host, port **6543** (transaction mode) + `?pgbouncer=true&connection_limit=1`; `DIRECT_URL` = port **5432** (session pooler) for schema pushes. Same credentials as backend/.env (that file is untracked and gets deleted with the backend).
- Models: `User` (`@@map("users")`, adopts GORM table, adds handle/major/year/bio/color), `Course` (code as id, requiredTopics String[]), `Summary` (slug unique, sections Json, topicsCovered String[], style enums Format/Depth/Tone), `Like` + `Save` (composite-pk join tables, cascade delete). Snake_case table maps + column maps for created_at/updated_at.
- Sync with `prisma db pull` first (confirm exact GORM column types), then `prisma db push` (no migration history — pragmatic for demo; docs note the `migrate` upgrade path). New unique `handle` column: add without unique → backfill → add unique in a second push (safe with existing rows).

**Auth** (`lib/auth.ts`) — same credential model, cookie-based for SSR
- bcryptjs (verifies existing Go hashes) + jose JWT HS256, **same `JWT_SECRET`, `sub` claim, 72h expiry** → tokens stay compatible with what the old API issued.
- httpOnly cookie `token` (secure in prod, sameSite lax). `getSessionUser()` reads cookie via `next/headers`, verifies, loads user from DB.
- Server actions: `register` (auto-unique handle from name), `login`, `logout`.
- API parity with the old Go API: `/api/register`, `/api/login`, `/api/me` route handlers returning the same JSON shapes (`{user, token}` / `{user}` / `{error}`).

**Data layer** — replace mock store
- Delete `lib/store.ts` + `lib/mock-data.ts`; new `lib/data.ts` maps Prisma rows (sections Json, `_count.likes/_count.saves`) into the existing `lib/types.ts` shapes — `lib/recommend.ts` and all UI components stay untouched.
- Seed → `prisma/seed.ts`: the 9 demo students (hashed shared password `password123`, documented on the login page), 8 courses, 16 summaries (same content as before).
- Actions (`lib/actions.ts`): `createSummary`/like/save now hit the DB; like/save redirect to `/login` when signed out; `revalidatePath` stays.

**UI updates (small)**
- `Header.tsx`: real session user avatar/name (or Join/Login buttons when signed out); nav "My profile" → session user's `/students/[handle]`.
- Home: "Matched to your style" rail only when signed in; logged-out visitors get trending + popular courses.
- `/share` requires login (redirect). New `/login` + `/register` pages (client forms → server actions, error display, demo-credentials hint).

**Go backend removal**
- `git rm -r` the tracked backend files + delete the untracked `.env` (secrets) — staged deletion, left for the user to commit (also worth rotating the Supabase password since it sat in a plaintext file).

**Vercel readiness**
- `package.json`: deps `prisma`, `@prisma/client`, `bcryptjs`, `jose`; `postinstall: prisma generate`; scripts `db:push`, `db:seed`.
- `binaryTargets = ["native", "rhel-openssl-3.0.x"]` in the generator.
- `.env.example` (DATABASE_URL / DIRECT_URL / JWT_SECRET) + `.env` (real values, already gitignored by root `.env*`).
- README: Vercel steps — import repo, **Root Directory = `frontend/front`**, set the 3 env vars, deploy; keep app at `frontend/front` (no repo restructure).

## Verification

1. `bun install` → `prisma db push` (users table adopted, not dropped) → seed.
2. `bun run lint` + `bun run build`.
3. Dev-server walkthrough: register a new user → login/logout; login as seeded Pat → like/save toggles persist in DB (verify via SQL); share a summary → appears in browse/course/profile; recommendations work off real likes; old Go-era `users` rows still present with valid logins.
4. API parity: curl `/api/register`, `/api/login`, `/api/me` (bearer token), matching old response shapes.
