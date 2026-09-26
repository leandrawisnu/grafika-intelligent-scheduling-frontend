import { NextRequest, NextResponse } from "next/server";
import {
  apiOrigin,
  secureFromForwarded,
  sessionCookieName,
} from "@/lib/session-cookie";

async function teruskan(req: NextRequest, path: string[]) {
  if (path[0] === "auth") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const secure = secureFromForwarded(
    req.headers.get("x-forwarded-proto"),
    req.nextUrl.protocol,
  );
  const token = req.cookies.get(sessionCookieName(secure))?.value;
  const target = `${apiOrigin()}/api/v1/${path.join("/")}${req.nextUrl.search}`;
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (token) headers.set("X-GIS-Session", token);
  const body =
    req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer();
  const go = await fetch(target, {
    method: req.method,
    headers,
    body,
    cache: "no-store",
  });
  const out = new Headers();
  const responseType = go.headers.get("content-type");
  if (responseType) out.set("content-type", responseType);
  out.set("cache-control", "no-store");
  return new NextResponse(await go.arrayBuffer(), { status: go.status, headers: out });
}

type Konteks = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Konteks) {
  const { path } = await ctx.params;
  return teruskan(req, path);
}

export async function POST(req: NextRequest, ctx: Konteks) {
  const { path } = await ctx.params;
  return teruskan(req, path);
}

export async function PUT(req: NextRequest, ctx: Konteks) {
  const { path } = await ctx.params;
  return teruskan(req, path);
}

export async function DELETE(req: NextRequest, ctx: Konteks) {
  const { path } = await ctx.params;
  return teruskan(req, path);
}
