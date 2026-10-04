import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};

const TECNICO_PREFIXES = ["/admin/mis-tareas"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/portal")) {
    if (session.rol === "CLIENTE" || session.rol === "ADMIN") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // pathname is under /admin from here on
  if (session.rol === "CLIENTE") {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  if (session.rol === "TECNICO") {
    const permitido = TECNICO_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (!permitido) {
      return NextResponse.redirect(new URL("/admin/mis-tareas", request.url));
    }
  }

  return NextResponse.next();
}
