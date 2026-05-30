import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PAGE_PREFIXES = ['/admin', '/super-admin', '/officers', '/customizer'];

const PUBLIC_PAGE_PREFIXES = ['/auth', '/login', '/register', '/forgot-password'];

/** API routes that do not require a logged-in session (method-specific where noted). */
function isPublicApiRoute(pathname: string, method: string): boolean {
  if (pathname.startsWith('/api/auth/')) return true;
  if (pathname.startsWith('/api/public-profile/')) return true;
  if (pathname.startsWith('/api/public-templates/')) return true;
  if (pathname.startsWith('/api/public/')) return true;
  if (pathname === '/api/contact/send' && method === 'POST') return true;
  if (pathname === '/api/leads' && method === 'POST') return true;
  if (pathname === '/api/officers/manual-rates' && method === 'GET') return true;
  if (pathname === '/api/officers/selected-rates' && method === 'GET') return true;
  if (pathname.startsWith('/api/mortech/')) return true;
  if (pathname === '/api/health') return true;
  if (pathname.startsWith('/api/widgets/')) return true;
  if (pathname.startsWith('/api/cron/')) return true;
  if (pathname === '/api/send-verification' && method === 'POST') return true;
  if (pathname.startsWith('/api/oauth/')) return true;
  if (pathname.startsWith('/api/ghl/oauth/')) return true;
  if (pathname === '/api/auth/request-password-reset' && method === 'POST') return true;
  if (pathname === '/api/auth/complete-password-reset' && method === 'POST') return true;
  if (pathname === '/api/auth/password-reset-token' && method === 'POST') return true;
  return false;
}

async function getSessionUser(request: NextRequest, response: NextResponse) {
  const authHeader = request.headers.get('authorization');
  const bearer =
    authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  if (bearer) {
    const { data, error } = await supabase.auth.getUser(bearer);
    if (!error && data.user) return data.user;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublicPage = PUBLIC_PAGE_PREFIXES.some((p) => pathname.startsWith(p));
  const isApi = pathname.startsWith('/api/');
  const needsAuth = isProtectedPage || (isApi && !isPublicApiRoute(pathname, method));

  if (!needsAuth) {
    return response;
  }

  const user = await getSessionUser(request, response);

  if (!user) {
    if (isApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPage && user) {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
