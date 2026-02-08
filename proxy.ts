import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Make sure '/sign-in(.*)' is here!
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/'
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // This regex allows cookies to pass to your pages
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};