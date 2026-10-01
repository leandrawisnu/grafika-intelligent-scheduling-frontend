import { NextRequest, NextResponse } from "next/server";
import {
  apiOrigin,
  secureFromForwarded,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/session-cookie";

export async function GET(req: NextRequest) {
  const secure = secureFromForwarded(
    req.headers.get("x-forwarded-proto"),
    req.nextUrl.protocol,
  );
  const token = req.cookies.get(sessionCookieName(secure))?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Sesi tidak berlaku." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
  const go = await fetch(`${apiOrigin()}/api/v1/auth/sesi`, {
    headers: { "X-GIS-Session": token },
    cache: "no-store",
  });
  const data = await go.json().catch(() => ({ error: "Sesi tidak berlaku." }));
  const res = NextResponse.json(data, {
    status: go.status,
    headers: { "Cache-Control": "no-store" },
  });
  if (go.status === 401) {
    res.cookies.set(sessionCookieName(secure), "", {
      ...sessionCookieOptions(secure),
      maxAge: 0,
    });
  }
  return res;
}
