# SkillSchool — education summary-sharing demo (Skillshare-style)

## Context

Build a frontend demo in this repo (fresh Next.js 16.3.3 + Tailwind v4 + TS scaffold, App Router) of a Skillshare-like platform adapted for school: students share **course content summaries** tied to **course requirements**, and get a **recommendation system that matches summaries by writing style**. Mock data first, backend later — so all data lives in a seeded in-memory store, mutations use Server Actions. No auth: a fixed demo user ("you").

Decisions (no user preference given): name **SkillSchool**, content **English**, requirements = **course required-topics coverage** checklists.

## Architecture

- **Data** (`lib/`):
  - `lib/types.ts` — `Student`, `Course`, `Summary` types. Summary carries style metadata: `format` (outline | bullets | narrative | qa | mindmap | flashcards), `depth` (quick-review | standard | deep-dive), `tone` (concise | friendly | academic), `language`, `hasExamples/hasFormulas/hasDiagrams`, `topicsCovered[]` (refs `course.requiredTopics`), `likes/saves`, `sections: {heading, body}[]`.
  - `lib/mock-data.ts` — ~8 courses (e.g. Data Structures, Calculus II, Microeconomics, Organic Chemistry, Academic English…), ~8 students, ~14 summaries with real study content in varied styles/formats.
  - `lib/store.ts` — in-memory store singleton on `globalThis` (survives HMR), with getters (`getSummaries`, `getSummary(id)`, `getCourses`, `getStudent(handle)`…) and mutators (`addSummary`, `likeSummary`, `saveSummary`). Note in README: resets on server restart — swappable for a real API later.
  - `lib/recommend.ts` — demo recommender: each summary → numeric style vector (one-hot format/depth/tone/language + boolean features); cosine similarity. `recommendForSummary(id)` (same-style, same-course boost) and `recommendForUser()` (taste profile = mean vector of your uploads + likes), each returning `{summary, matchPct, reasons[]}` for "87% style match · same course" badges.
  - `lib/actions.ts` — `'use server'`: `createSummary(formData)` (→ redirect to new summary), `toggleLike(id)`, `toggleSave(id)`; each calls `revalidatePath`.

- **Routes** (`app/`):
  - `/` — hero, "Matched to your summary style" rail (match %), trending summaries, popular courses.
  - `/browse` — all summaries; client-side `FilterBar` (search, course, style, sort) over data passed as props.
  - `/summary/[id]` — `SummaryBody` renderer per format (bullets/outline/Q&A/mind-map/flashcards/narrative), author card, topic-coverage checklist vs course requirements, like/save (Server Actions), "Same style" rail.
  - `/share` — share form (`useActionState` client component + server action): course select, style/depth/tone pickers, topic checkboxes, sections editor.
  - `/courses` and `/courses/[code]` — course info, required-topics list, summaries with coverage counts.
  - `/students/[handle]` — profile: style chips, their summaries, "students with similar style".
  - `not-found.tsx`; update `app/layout.tsx` metadata/header/footer; design tokens in `app/globals.css`.

- **Components** (`components/`): `Header`, `SummaryCard`, `StyleBadge`, `CoursePill`, `LikeButton` (client, optimistic), `RecommendRail`, `TopicCoverage`, `SummaryBody`, `ShareForm`, `FilterBar`, `Avatar` (CSS initials — no external images; CSP blocks other hosts).

- **Design**: friendly Skillshare look — card grid, rounded-2xl, pill badges, indigo→violet accent gradient, soft shadows; tokens via Tailwind v4 `@theme` in `globals.css`, keep existing dark-mode media query.

## Constraints from repo docs

- Next 16: `params`/`searchParams` are Promises (`await props.params`); global `PageProps<'/route'>`/`LayoutProps` helpers available; Server Actions via `action` prop; `cacheComponents` is off → no Suspense gymnastics needed for module-scope mock data.
- Per AGENTS.md I already read `node_modules/next/dist/docs/` guides; keep that block in AGENTS.md untouched.

## Verification

1. `bun run dev` (bun.lock present) — walk every page: home rails, browse filters, summary pages render each format, course coverage checklists, profiles.
2. Share a summary via `/share` → redirects to it, appears in `/browse`, its course page, and same-style recommendation rails; like/save buttons increment and persist across navigation.
3. `bun run lint` and `bun run build` pass.
