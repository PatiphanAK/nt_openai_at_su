import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateHandle,
  hashPassword,
  pickAvatarColor,
  setSessionCookie,
  signToken,
} from "@/lib/auth";

/**
 * JSON parity with the old Go API: POST /api/register
 * → 201 { user: { id, email, name, created_at, updated_at }, token }
 * Also sets the httpOnly session cookie used by the web app.
 */
export async function POST(request: Request) {
  let body: { email?: string; name?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim();
  const password = body.password ?? "";

  if (!email || password.length < 6) {
    return NextResponse.json(
      { error: "email and password (min 6 chars) required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "email already registered" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email,
      name,
      password: await hashPassword(password),
      handle: await generateHandle(name || email.split("@")[0], email),
      color: pickAvatarColor(),
    },
  });

  const token = await signToken(user.id);
  await setSessionCookie(token);
  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
    },
    { status: 201 }
  );
}
