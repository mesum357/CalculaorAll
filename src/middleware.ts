import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { URL_CODE_TO_LANGUAGE } from '@/lib/language-routing';

// Valid language codes
const VALID_LANG_CODES = Object.keys(URL_CODE_TO_LANGUAGE);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/auth')
  ) {
    return NextResponse.next();
  }

  const pathnameParts = pathname.split('/').filter(Boolean);
  const firstPart = pathnameParts[0];

  // Check if the first part is a valid language code
  if (VALID_LANG_CODES.includes(firstPart)) {
    // Language code is already in the URL, rewrite to remove it for internal routing
    const pathWithoutLang = pathnameParts.length > 1 
      ? '/' + pathnameParts.slice(1).join('/')
      : '/';
    const url = request.nextUrl.clone();
    url.pathname = pathWithoutLang;
    // Set header to indicate the language for the app
    const response = NextResponse.rewrite(url);
    response.headers.set('x-language', firstPart);
    return response;
  }

  // No language code in URL, redirect to /en/ prefix (or saved language preference)
  // Check for saved language preference in cookie
  const savedLang = request.cookies.get('preferredLanguage')?.value;
  const langCode = savedLang && VALID_LANG_CODES.includes(savedLang) ? savedLang : 'en';
  const newPathname = `/${langCode}${pathname === '/' ? '' : pathname}`;
  const url = request.nextUrl.clone();
  url.pathname = newPathname;
  
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
};

