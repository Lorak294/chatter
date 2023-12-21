import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const protectedRoutes = ["/dashboard"];

    // manage route protection
    const authenticated = await getToken({ req });
    const accessingAnnonymous =
      pathname.startsWith("/login") || pathname === "/";
    const accessingProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (authenticated && accessingAnnonymous) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (!authenticated && accessingProtectedRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      async authorized() {
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
