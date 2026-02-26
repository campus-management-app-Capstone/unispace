import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

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

  // already login
  // get role
  const { sessionClaims } = await auth();
  const userRole = sessionClaims?.metadata?.role;

  // check student and lecturer only, not admin
  if (!isAdminRoute(req) && userRole === 'admin' && !isPublicRoute(req)) {
    // is a admin, not allow to access other than admin page
    const redirectUrl = new URL('/admin', req.url); // redirect to admin page
    return NextResponse.redirect(redirectUrl);
  }

  // check admin only for admin route
  if (isAdminRoute(req) && userRole !== 'admin' && !isPublicRoute(req)) {
    //not admin
    const redirectUrl = new URL('/home', req.url); // redirect to home page
    return NextResponse.redirect(redirectUrl);

  }
});

export const config = {
  matcher: [
    // This regex allows cookies to pass to your pages
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};