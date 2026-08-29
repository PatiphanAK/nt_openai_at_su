import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, signToken, verifyPassword } from "@/lib/auth";

/**
 * JSON parity with the old Go API: POST /api/login
 * → 200 { user: { id, email, name, created_at, updated_at }, token }
 * Also sets the httpOnly session cookie used by the web app.
 */
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const token = await signToken(user.id);
  await setSessionCookie(token);
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
    token,
  });
}
