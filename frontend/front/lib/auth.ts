import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";
import type { Student } from "./types";

/**
 * Session auth for the full-stack app.
 *
 * Same credential model as the old Go API: bcrypt password hashes in the
 * shared `users` table and HS256 JWTs with a `sub` claim and 72h expiry,
 * signed with JWT_SECRET — tokens issued by either stack verify in the other.
 * The token lives in an httpOnly cookie instead of the Authorization header
 * so server components can read the session.
 */

const COOKIE_NAME = "token";
const MAX_AGE_SECONDS = 72 * 60 * 60; // 72h, same as the Go backend

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}

/** The signed-in user's id, or null when signed out. */
export async function getSessionUserId(): Promise<string | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return verifyToken(token);
}

export function toStudent(user: {
  id: string;
  handle: string;
  name: string;
  major: string;
  year: number;
  color: string;
  bio: string;
}): Student {
  return {
    id: user.id,
    handle: user.handle,
    name: user.name,
    major: user.major,
    year: user.year,
    color: user.color,
    bio: user.bio,
  };
}

/** The signed-in user, or null. Verifies the cookie against the DB. */
export async function getCurrentUser(): Promise<Student | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return toStudent(user);
}

/** Build a unique handle from a display name (e.g. "Mia Tanaka" -> "miatanaka"). */
export async function generateHandle(name: string, email: string): Promise<string> {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 20) ||
    email.split("@")[0].toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20) ||
    "student";
  let handle = base;
  let i = 2;
  while (await prisma.user.findUnique({ where: { handle }, select: { id: true } })) {
    handle = `${base}${i++}`;
  }
  return handle;
}

const AVATAR_COLORS = [
  "from-indigo-500 to-violet-500",
  "from-rose-400 to-pink-500",
  "from-sky-400 to-blue-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-sky-500",
  "from-fuchsia-400 to-rose-500",
  "from-lime-400 to-green-500",
];

export function pickAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}
