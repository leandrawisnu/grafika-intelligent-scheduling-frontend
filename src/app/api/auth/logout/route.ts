import { NextRequest, NextResponse } from "next/server";
import {
  apiOrigin,
  secureFromForwarded,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/session-cookie";

export async function POST(req: NextRequest) {
  const secure = secureFromForwarded(
    req.headers.get("x-forwarded-proto"),
    req.nextUrl.protocol,
  );
  const name = sessionCookieName(secure);
  const token = req.cookies.get(name)?.value;
  if (token) {
    await fetch(`${apiOrigin()}/api/v1/auth/keluar`, {
      method: "POST",
      headers: { "X-GIS-Session": token },
      cache: "no-store",
    }).catch(() => undefined);
  }
  const res = NextResponse.json(
    { status: "keluar" },
    { headers: { "Cache-Control": "no-store" } },
  );
  const options = sessionCookieOptions(secure);
  res.cookies.set(name, "", { ...options, maxAge: 0 });
  return res;
}
