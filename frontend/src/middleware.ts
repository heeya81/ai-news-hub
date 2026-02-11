import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Note: Middleware runs on the Edge, so we check for cookies or headers.
    // However, since we store tokens in localStorage (client-side only),
    // a pure server-side middleware for localStorage won't work.
    // A better approach is using cookies for tokens if we want server-side protection.
    // For now, we'll implement a layout-level guard in AuthProvider and 
    // leave this middleware as a placeholder or use it if we switch to cookies.

    // Example for cookie-based auth:
    const token = request.cookies.get('ainews_token')?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
    const isProtectedPage = ['/dashboard', '/settings'].some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPage && !token) {
        // Redirection logic here would require the token to be in cookies.
        // Since we currently use localStorage, we'll keep the client-side guard in AuthProvider.
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/settings/:path*'],
};
