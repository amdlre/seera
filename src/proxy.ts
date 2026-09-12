import createMiddleware from "next-intl/middleware";
import { hasLocale } from "next-intl";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { verifySessionToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/constants/auth";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PREFIXES = ["/dashboard", "/builder"];
const ADMIN_PREFIX = "/admin";

function stripLocale(pathname: string): { locale: string; path: string } {
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];
  if (hasLocale(routing.locales, maybeLocale)) {
    return { locale: maybeLocale, path: `/${segments.slice(1).join("/")}` };
  }
  return { locale: routing.defaultLocale, path: pathname };
}

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const intlResponse = intlMiddleware(request);
  const { locale, path } = stripLocale(request.nextUrl.pathname);

  const isAdminRoute = path.startsWith(ADMIN_PREFIX);
  const isProtectedRoute = isAdminRoute || PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));

  if (!isProtectedRoute) {
    return intlResponse;
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (isAdminRoute && session.role !== "admin") {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Admins work only inside the admin area; the builder and personal dashboard
  // belong to regular users.
  if (!isAdminRoute && session.role === "admin") {
    return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|print|opengraph-image|.*\\..*).*)"],
};
