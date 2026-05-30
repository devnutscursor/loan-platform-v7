import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { getSupabaseService } from '@/lib/supabase/service';

export type AppRole = 'super_admin' | 'company_admin' | 'employee';

export interface AuthContext {
  userId: string;
  email: string;
  role: AppRole;
  /** Primary active company (admin or employee). Null for super_admin. */
  companyId: string | null;
  user: User;
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

async function resolveAuthUser(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get('authorization');
  const bearer =
    authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null;

  if (bearer) {
    const admin = getSupabaseService();
    const { data, error } = await admin.auth.getUser(bearer);
    if (!error && data.user) return data.user;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Route handlers cannot always set cookies; session refresh is handled elsewhere.
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Load role + company from DB (service role — app-layer auth, not RLS).
 */
export async function getAuthFromRequest(request: NextRequest): Promise<AuthContext | null> {
  const user = await resolveAuthUser(request);
  if (!user?.id || !user.email) return null;

  const supabase = getSupabaseService();

  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('id, role, deactivated, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (userError || !userRow) return null;
  if (userRow.deactivated) return null;
  if (userRow.is_active === false) return null;

  const role = userRow.role as AppRole;
  if (!['super_admin', 'company_admin', 'employee'].includes(role)) return null;

  let companyId: string | null = null;

  if (role === 'super_admin') {
    return { userId: user.id, email: user.email, role, companyId: null, user };
  }

  if (role === 'company_admin') {
    const { data: uc } = await supabase
      .from('user_companies')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    companyId = uc?.company_id ?? null;
  } else {
    const { data: uc } = await supabase
      .from('user_companies')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    companyId = uc?.company_id ?? null;
  }

  return { userId: user.id, email: user.email, role, companyId, user };
}

type RequireAuthOptions = {
  roles?: AppRole[];
};

export async function requireAuth(
  request: NextRequest,
  options?: RequireAuthOptions,
): Promise<{ ctx: AuthContext } | NextResponse> {
  const ctx = await getAuthFromRequest(request);
  if (!ctx) return unauthorizedResponse();
  if (options?.roles?.length && !options.roles.includes(ctx.role)) {
    return forbiddenResponse('Insufficient permissions');
  }
  return { ctx };
}

export async function requireSuperAdmin(
  request: NextRequest,
): Promise<{ ctx: AuthContext } | NextResponse> {
  return requireAuth(request, { roles: ['super_admin'] });
}

export async function requireCompanyAdminOrSuperAdmin(
  request: NextRequest,
): Promise<{ ctx: AuthContext } | NextResponse> {
  return requireAuth(request, { roles: ['super_admin', 'company_admin'] });
}

/** Caller may only access their own user id unless admin. */
export function assertSelfOrAdmin(ctx: AuthContext, targetUserId: string): NextResponse | null {
  if (ctx.userId === targetUserId) return null;
  if (ctx.role === 'super_admin') return null;
  return forbiddenResponse();
}

export async function assertCanManageOfficer(
  ctx: AuthContext,
  officerId: string,
): Promise<NextResponse | null> {
  if (ctx.role === 'super_admin') return null;
  if (ctx.role !== 'company_admin' || !ctx.companyId) {
    return forbiddenResponse();
  }

  const supabase = getSupabaseService();
  const { data } = await supabase
    .from('user_companies')
    .select('id')
    .eq('user_id', officerId)
    .eq('company_id', ctx.companyId)
    .eq('role', 'employee')
    .limit(1)
    .maybeSingle();

  if (!data) return forbiddenResponse('You cannot manage this officer');
  return null;
}

export async function assertCanManageCompany(
  ctx: AuthContext,
  companyId: string,
): Promise<NextResponse | null> {
  if (ctx.role === 'super_admin') return null;
  if (ctx.role === 'company_admin' && ctx.companyId === companyId) return null;
  return forbiddenResponse('You cannot manage this company');
}

/** Officer self, their company admin, or super admin may read/write officer-scoped data. */
export async function assertCanAccessOfficer(
  ctx: AuthContext,
  officerId: string,
): Promise<NextResponse | null> {
  if (ctx.userId === officerId) return null;
  if (ctx.role === 'super_admin') return null;
  return assertCanManageOfficer(ctx, officerId);
}

export async function assertOwnsPublicLink(
  ctx: AuthContext,
  linkId: string,
): Promise<NextResponse | null> {
  const supabase = getSupabaseService();
  const { data } = await supabase
    .from('loan_officer_public_links')
    .select('user_id, company_id')
    .eq('id', linkId)
    .maybeSingle();

  if (!data) return forbiddenResponse('Public link not found');
  if (ctx.userId === data.user_id) return null;
  if (ctx.role === 'super_admin') return null;
  if (ctx.role === 'company_admin' && ctx.companyId === data.company_id) return null;
  return forbiddenResponse();
}

/** Public lead submission: officer must belong to company and have an active public link. */
export async function validatePublicLeadTarget(
  officerId: string,
  companyId: string,
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const supabase = getSupabaseService();

  const { data: uc } = await supabase
    .from('user_companies')
    .select('id')
    .eq('user_id', officerId)
    .eq('company_id', companyId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (!uc) {
    return { ok: false, status: 400, message: 'Invalid officer or company' };
  }

  const { data: link } = await supabase
    .from('loan_officer_public_links')
    .select('id, is_active, expires_at, max_uses, current_uses')
    .eq('user_id', officerId)
    .eq('company_id', companyId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (!link) {
    return { ok: false, status: 400, message: 'Officer public profile is not available' };
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return { ok: false, status: 410, message: 'Public profile has expired' };
  }

  if (link.max_uses != null && (link.current_uses ?? 0) >= link.max_uses) {
    return { ok: false, status: 410, message: 'Public profile usage limit reached' };
  }

  const { data: officer } = await supabase
    .from('users')
    .select('deactivated, is_active')
    .eq('id', officerId)
    .maybeSingle();

  if (!officer || officer.deactivated || officer.is_active === false) {
    return { ok: false, status: 400, message: 'Officer is not available' };
  }

  return { ok: true };
}

/** Verify recipient is an active loan officer email (contact form). */
export async function validateOfficerRecipientEmail(
  recipientEmail: string,
): Promise<boolean> {
  const normalized = recipientEmail.trim().toLowerCase();
  const supabase = getSupabaseService();
  const { data } = await supabase
    .from('users')
    .select('id, deactivated, is_active')
    .eq('email', normalized)
    .eq('role', 'employee')
    .maybeSingle();

  return Boolean(data && !data.deactivated && data.is_active !== false);
}

export function verifyBearerSecret(request: NextRequest, envVar: string): boolean {
  const expected = process.env[envVar];
  if (!expected) return false;

  const authHeader = request.headers.get('authorization') ?? '';
  const expectedBearer = `Bearer ${expected}`;

  const a = Buffer.from(authHeader);
  const b = Buffer.from(expectedBearer);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyPlainSecret(provided: string | null | undefined, envVar: string): boolean {
  const expected = process.env[envVar];
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
