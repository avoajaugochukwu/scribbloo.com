import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the environment is production AND the path starts with /admin
  if (process.env.NODE_ENV === 'production' && pathname.startsWith('/admin')) {
    // Option 1: Redirect to homepage (user-friendly block)
    // const homeUrl = new URL('/', request.url);
    // return NextResponse.redirect(homeUrl);

    // Option 2: Return a 404 Not Found response (makes the page seem non-existent)
    // This is generally better for hiding admin routes.
    return new NextResponse(null, { status: 404 });
  }

  // Allow the request to proceed in development or for any other path
  return NextResponse.next();
}

// Configure the middleware to run only on admin paths
export const config = {
  // This ensures the middleware only runs for requests to /admin or /admin/*
  matcher: '/admin/:path*',
}; 