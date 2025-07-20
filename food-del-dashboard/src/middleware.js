import { NextResponse } from 'next/server';

export function middleware(request) {
    const path = request.nextUrl.pathname;

    const publicPaths = ['/login', '/register', '/_next', '/api', '/public'];

    const isPublicPath = publicPaths.some(publicPath =>
        path === publicPath || path.startsWith(publicPath + '/')
    );

    const token = request.cookies.get('authToken')?.value;

    if (isPublicPath && token) {
        if (path === '/login' || path === '/register') {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    if (!isPublicPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};