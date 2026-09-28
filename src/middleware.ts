import { NextRequest, NextResponse } from "next/server";
import {
  apiOrigin,
  secureFromForwarded,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/session-cookie";

function tanpaCache(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store");
  return res;
}

function halamanLogin(req: NextRequest, hapusCookie: boolean) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  const res = tanpaCache(NextResponse.redirect(url));
  res.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  res.headers.set("X-Frame-Options", "DENY");
  if (hapusCookie) {
    const secure = secureFromForwarded(req.headers.get("x-forwarded-proto"), req.nextUrl.protocol);
    const options = sessionCookieOptions(secure);
    res.cookies.set(sessionCookieName(secure), "", { ...options, maxAge: 0 });
  }
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const secure = secureFromForwarded(req.headers.get("x-forwarded-proto"), req.nextUrl.protocol);
  const token = req.cookies.get(sessionCookieName(secure))?.value;
  const halamanMasuk = pathname === "/login" || pathname.startsWith("/login/");

  if (pathname === "/api/auth/login" || pathname === "/api/auth/logout") {
    return tanpaCache(NextResponse.next());
  }

  if (!token) {
    if (halamanMasuk) {
      const res = tanpaCache(NextResponse.next());
      res.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
      res.headers.set("X-Frame-Options", "DENY");
      return res;
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Sesi tidak berlaku." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
    return halamanLogin(req, false);
  }

  const cek = await fetch(`${apiOrigin()}/api/v1/auth/sesi`, {
    headers: { "X-GIS-Session": token },
    cache: "no-store",
  });
  if (!cek.ok) {
    if (pathname.startsWith("/api/")) {
      const res = NextResponse.json(
        { error: "Sesi tidak berlaku." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
      const options = sessionCookieOptions(secure);
      res.cookies.set(sessionCookieName(secure), "", { ...options, maxAge: 0 });
      return res;
    }
    if (halamanMasuk) {
      const res = tanpaCache(NextResponse.next());
      res.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
      res.headers.set("X-Frame-Options", "DENY");
      const options = sessionCookieOptions(secure);
      res.cookies.set(sessionCookieName(secure), "", { ...options, maxAge: 0 });
      return res;
    }
    return halamanLogin(req, true);
  }

  if (halamanMasuk) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return tanpaCache(NextResponse.redirect(url));
  }

  const res = tanpaCache(NextResponse.next());
  if (pathname === "/login") {
    res.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
    res.headers.set("X-Frame-Options", "DENY");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|Icons/).*)"],
};
