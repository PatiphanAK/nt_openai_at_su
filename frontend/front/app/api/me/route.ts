import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionToken, verifyToken } from "@/lib/auth";

/**
 * JSON parity with the old Go API: GET /api/me
 * Accepts the JWT via the Authorization header (Bearer, like the Go API)
 * or the httpOnly session cookie the web app uses.
 * → 200 { user } | 401 { error } | 404 { error }
 */
export async function GET(request: Request) {
  const header = request.headers.get("Authorization");
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const token = bearer ?? (await getSessionToken());
  if (!token) {
    return NextResponse.json({ error: "missing bearer token" }, { status: 401 });
  }

  const userId = await verifyToken(token);
  if (!userId) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  });
}
