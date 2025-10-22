import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/login", "/register", "/api", "/_next", "/favicon.ico"];

// Regex for static files (images, fonts, etc.)
const STATIC_FILE_REGEX =
  /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot)$/i;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Allow public paths and static files
  if (
    PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    STATIC_FILE_REGEX.test(pathname)
  ) {
    return NextResponse.next();
  }
  // Check for valid session token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|login|register).*)",
    "/((?!.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$|.*\\.ico$|.*\\.css$|.*\\.js$|.*\\.woff2?$|.*\\.ttf$|.*\\.eot$).*)",
  ],
};
