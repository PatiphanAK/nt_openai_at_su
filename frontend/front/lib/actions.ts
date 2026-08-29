"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import {
  clearSessionCookie,
  generateHandle,
  getSessionUserId,
  hashPassword,
  pickAvatarColor,
  setSessionCookie,
  signToken,
  verifyPassword,
} from "./auth";
import { createSummary, toggleLike, toggleSave } from "./data";
import type { SummaryFormat, SummaryDepth, SummaryTone } from "./types";

export interface ShareFormState {
  error?: string;
}

export interface AuthFormState {
  error?: string;
}

const FORMATS: SummaryFormat[] = ["outline", "bullets", "narrative", "qa", "mindmap", "flashcards"];
const DEPTHS: SummaryDepth[] = ["quick-review", "standard", "deep-dive"];
const TONES: SummaryTone[] = ["concise", "friendly", "academic"];

function pick<T extends string>(value: FormDataEntryValue | null, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

// ---------- auth actions ----------

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const major = String(formData.get("major") ?? "").trim();
  const year = Number(formData.get("year") ?? 1);
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "Tell us your name (at least 2 characters)." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "That email is already registered — try logging in." };

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email,
      name,
      password: await hashPassword(password),
      handle: await generateHandle(name, email),
      major,
      year: Number.isInteger(year) && year >= 1 && year <= 8 ? year : 1,
      color: pickAvatarColor(),
    },
  });

  await setSessionCookie(await signToken(user.id));
  revalidatePath("/", "layout");
  redirect("/");
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return { error: "Invalid email or password." };
  }

  await setSessionCookie(await signToken(user.id));
  revalidatePath("/", "layout");
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  revalidatePath("/", "layout");
  redirect("/");
}

// ---------- summary actions ----------

export async function createSummaryAction(
  _prevState: ShareFormState,
  formData: FormData
): Promise<ShareFormState> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const courseId = String(formData.get("courseId") ?? "");
  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (title.length < 4) {
    return { error: "Give your summary a title (at least 4 characters)." };
  }
  if (!course) {
    return { error: "Pick the course this summary belongs to." };
  }

  const sections: { heading: string; body: string }[] = [];
  for (let i = 0; formData.get(`section-heading-${i}`) !== null; i++) {
    const heading = String(formData.get(`section-heading-${i}`) ?? "").trim();
    const body = String(formData.get(`section-body-${i}`) ?? "")
      .split("\n")
      .map((l) => l.trimEnd())
      .join("\n")
      .trim();
    if (heading || body) {
      sections.push({ heading: heading || "Notes", body });
    }
  }
  if (sections.length === 0) {
    return { error: "Add at least one section with some content." };
  }

  const selected = formData.getAll("topics").filter((t): t is string => typeof t === "string");
  const topicsCovered = course.requiredTopics.filter((t) => selected.includes(t));

  const summary = await createSummary(
    {
      title,
      courseId: course.id,
      format: pick(formData.get("format"), FORMATS, "bullets"),
      depth: pick(formData.get("depth"), DEPTHS, "standard"),
      tone: pick(formData.get("tone"), TONES, "friendly"),
      hasExamples: formData.get("hasExamples") !== null,
      hasFormulas: formData.get("hasFormulas") !== null,
      hasDiagrams: formData.get("hasDiagrams") !== null,
      topicsCovered,
      sections,
    },
    userId
  );

  // Refresh every surface that lists summaries (home rails, browse, course, profile).
  revalidatePath("/", "layout");
  redirect(`/summary/${summary.slug}`);
}

export async function likeSummaryAction(slug: string): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const summary = await prisma.summary.findUnique({ where: { slug }, select: { id: true } });
  if (!summary) return;
  await toggleLike(userId, summary.id);
  revalidatePath("/", "layout");
}

export async function saveSummaryAction(slug: string): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");
  const summary = await prisma.summary.findUnique({ where: { slug }, select: { id: true } });
  if (!summary) return;
  await toggleSave(userId, summary.id);
  revalidatePath("/", "layout");
}
