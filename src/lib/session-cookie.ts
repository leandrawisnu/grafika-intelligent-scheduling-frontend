export const SESSION_MAX_AGE = 60 * 60 * 24;

export function sessionCookieName(secure: boolean) {
  return secure ? "__Host-gis_session" : "gis_session";
}

export function apiOrigin() {
  return process.env.GIS_API_URL || "http://127.0.0.1:8080";
}

export function secureFromForwarded(protocol: string | null, fallback: string) {
  const proto = (protocol || fallback).replace(":", "");
  return proto === "https";
}

export function sessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true as const,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
