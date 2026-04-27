import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    if (pathname.startsWith('/admin')) {
      if (req.nextauth.token?.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { matcher: ['/dashboard/:path*', '/updates/:path*', '/admin/:path*'] };
