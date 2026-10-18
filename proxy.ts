import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/menu(.*)",
  "/t/(.*)",
  "/sign-in(.*)",
  "/staff(.*)",
  "/terms(.*)",
  "/privacy(.*)",
  "/refund-policy(.*)",
  "/delivery-policy(.*)",
  "/contact(.*)",
  "/dev/(.*)",
  "/api/webhooks(.*)",
  "/api/cron(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (process.env.CLERK_SECRET_KEY) {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  } else {
    // In local dev without live Clerk Secret Key, allow access if session cookie or dev role is present
    const hasSession =
      req.cookies.has("__session") ||
      req.cookies.has("cd_dev_session") ||
      req.cookies.has("cd_staff_role");

    if (!isPublicRoute(req) && !hasSession && process.env.NODE_ENV === "production") {
      const url = new URL("/sign-in", req.url);
      url.searchParams.set("redirect_url", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
