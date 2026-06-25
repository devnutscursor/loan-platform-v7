import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db, manualRates, userCompanies, companies } from '@/lib/db';
import { and, eq } from 'drizzle-orm';
import crypto from 'crypto';
import { validatePublicLeadTarget } from '@/lib/api-auth';

function mapRateRow(row: any) {
  return {
    id: row.id,
    rateData: row.rateData ?? row.rate_data,
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at,
  };
}

async function getCompanyAccess(officerId: string) {
  const userCompanyResult = await db
    .select({ companyId: userCompanies.companyId })
    .from(userCompanies)
    .where(and(eq(userCompanies.userId, officerId), eq(userCompanies.isActive, true)))
    .limit(1);

  if (userCompanyResult.length === 0) {
    return null;
  }

  const companyId = userCompanyResult[0].companyId;
  const companyRows = await db
    .select({ hasMortechSubscription: companies.hasMortechSubscription })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  const hasMortechSubscription = companyRows[0]?.hasMortechSubscription !== false;
  return { companyId, hasMortechSubscription };
}

/**
 * GET /api/officers/manual-rates
 * - Public mode: ?officerId=... (no auth)
 * - Auth mode: bearer token
 */
export async function GET(request: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  try {
    const { searchParams } = new URL(request.url);
    const officerIdParam = searchParams.get('officerId');

    let officerId: string;
    if (officerIdParam) {
      officerId = officerIdParam;
      const access = await getCompanyAccess(officerId);
      if (!access) {
        return NextResponse.json({ error: 'Officer not found' }, { status: 404 });
      }
      const publicCheck = await validatePublicLeadTarget(officerId, access.companyId);
      if (!publicCheck.ok) {
        return NextResponse.json({ error: publicCheck.message }, { status: publicCheck.status });
      }
    } else {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.substring(7);
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      officerId = user.id;
    }

    const access = await getCompanyAccess(officerId);
    if (!access) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (access.hasMortechSubscription) {
      return NextResponse.json({ success: true as const, rates: [] });
    }

    const rows = await db
      .select()
      .from(manualRates)
      .where(and(eq(manualRates.officerId, officerId), eq(manualRates.companyId, access.companyId)))
      .orderBy(manualRates.createdAt);

    return NextResponse.json({
      success: true as const,
      rates: rows.map(mapRateRow),
    });
  } catch (error) {
    console.error('❌ Error fetching manual rates:', error);
    return NextResponse.json({ error: 'Failed to fetch manual rates' }, { status: 500 });
  }
}

/**
 * POST /api/officers/manual-rates
 * Add a new manual rate (non-Mortech companies only)
 */
export async function POST(request: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const access = await getCompanyAccess(user.id);
    if (!access) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (access.hasMortechSubscription) {
      return NextResponse.json({ error: 'Manual rates are disabled for this company' }, { status: 403 });
    }

    const body = await request.json();
    const { rateData } = body || {};
    if (!rateData || typeof rateData !== 'object') {
      return NextResponse.json({ error: 'rateData is required' }, { status: 400 });
    }

    const rateDataWithId = {
      ...rateData,
      id: rateData.id || crypto.randomUUID(),
    };

    const [newRate] = await db
      .insert(manualRates)
      .values({
        officerId: user.id,
        companyId: access.companyId,
        rateData: rateDataWithId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      rate: mapRateRow(newRate),
    });
  } catch (error) {
    console.error('❌ Error adding manual rate:', error);
    return NextResponse.json({ error: 'Failed to add manual rate' }, { status: 500 });
  }
}

/**
 * DELETE /api/officers/manual-rates
 * Delete a manual rate by id (non-Mortech companies only)
 */
export async function DELETE(request: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const access = await getCompanyAccess(user.id);
    if (!access) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (access.hasMortechSubscription) {
      return NextResponse.json({ error: 'Manual rates are disabled for this company' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body || {};
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await db
      .delete(manualRates)
      .where(and(eq(manualRates.id, id), eq(manualRates.officerId, user.id), eq(manualRates.companyId, access.companyId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting manual rate:', error);
    return NextResponse.json({ error: 'Failed to delete manual rate' }, { status: 500 });
  }
}
