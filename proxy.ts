import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/menu(.*)",
  "/t/(.*)",
  "/sign-in(.*)",
  "/terms(.*)",
  "/privacy(.*)",
  "/refund-policy(.*)",
  "/delivery-policy(.*)",
  "/contact(.*)",
  "/dev/(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (process.env.CLERK_SECRET_KEY) {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  } else {
    // Offline/Development guard: unauthenticated access to protected routes redirects to sign-in
    if (!isPublicRoute(req)) {
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
