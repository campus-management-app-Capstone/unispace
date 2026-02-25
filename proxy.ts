import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

// check admin route
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

// Make sure '/sign-in(.*)' is here!
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/'
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Check if the user is trying to access the admin panel
  if (isAdminRoute(req)) {

    // get role
    const { sessionClaims } = await auth();
    const userRole = sessionClaims?.metadata?.role;

    //not admin
    if (userRole !== 'admin') {
      const redirectUrl = new URL('/home', req.url); // redirect to home page
      return NextResponse.redirect(redirectUrl);
    }
  }
});

export const config = {
  matcher: [
    // This regex allows cookies to pass to your pages
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};