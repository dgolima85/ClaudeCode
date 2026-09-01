import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "analistaId";
// Cookies de sessão do Auth.js (login via Microsoft Entra ID): nome sem
// prefixo em dev/http, com "__Secure-" em produção/https.
const AUTH_JS_SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];
// "/api/auth" precisa ficar público: é o callback que o Entra ID chama de
// volta durante o login, antes de qualquer cookie de sessão existir.
const PUBLIC_PATHS = ["/login", "/api/auth"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  const hasSession =
    request.cookies.has(SESSION_COOKIE) ||
    AUTH_JS_SESSION_COOKIES.some((name) => request.cookies.has(name));

  if (!hasSession && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
