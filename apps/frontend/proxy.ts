import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export function proxy(request: NextRequest) {
  // Check if the route is protected (starts with /dashboard, /beacons, /geofences, /sectors)
  const protectedPaths = ['/dashboard', '/beacons', '/geofences', '/sectors'];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath) {
    // In Next.js middleware (Edge Runtime), we can only check for session cookie existence
    // Full session validation happens in the page/route itself
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      // Redirect to login if no session cookie
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow access to login page
  if (request.nextUrl.pathname === '/login') {
    const sessionCookie = getSessionCookie(request);
    if (sessionCookie) {
      // Redirect to dashboard if already authenticated
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
