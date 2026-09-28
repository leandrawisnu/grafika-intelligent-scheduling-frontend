import { NextRequest, NextResponse } from "next/server";
import {
  apiOrigin,
  secureFromForwarded,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/session-cookie";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const go = await fetch(`${apiOrigin()}/api/v1/auth/masuk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });
  const data = (await go.json().catch(() => ({}))) as {
    error?: string;
    token?: string;
    pengguna?: unknown;
  };
  if (!go.ok || !data.token) {
    return NextResponse.json(
      { error: data.error || "Email atau kata sandi salah." },
      { status: go.status || 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const secure = secureFromForwarded(
    req.headers.get("x-forwarded-proto"),
    req.nextUrl.protocol,
  );
  const res = NextResponse.json(
    { pengguna: data.pengguna },
    { headers: { "Cache-Control": "no-store" } },
  );
  res.cookies.set(sessionCookieName(secure), data.token, sessionCookieOptions(secure));
  return res;
}
