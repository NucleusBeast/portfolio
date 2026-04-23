import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isSignInPage = createRouteMatcher(["/sign-in(.*)"]);
const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, redirectToSignIn } = await auth();

  if (isSignInPage(request) && userId) {
    return Response.redirect(new URL("/admin/projects", request.url));
  }

  if (isProtectedRoute(request) && !userId) {
    return redirectToSignIn({ returnBackUrl: request.url });
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
