import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Everything under /dashboard and /admin requires a signed-in user.
const isProtected = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
