import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { and, eq } from 'drizzle-orm';
import { createMortechAPI } from '@/lib/mortech/api';
import { db, selectedRates, userCompanies } from '@/lib/db';
import { PROGRAM_BUCKETS } from '@/lib/mortech/programBuckets';
import { seedSelectedRatesForOfficer } from '@/lib/mortech/seedSelectedRates';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type SelectedRateRow = {
  id: string;
  rateData: any;
  createdAt: string;
  updatedAt: string;
};

function mapDbRow(row: any): SelectedRateRow {
  return {
    id: row.id,
    rateData: row.rateData,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify Supabase user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Resolve officer's active company
    const userCompanyResult = await db
      .select({ companyId: userCompanies.companyId })
      .from(userCompanies)
      .where(and(eq(userCompanies.userId, user.id), eq(userCompanies.isActive, true)))
      .limit(1);

    if (userCompanyResult.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const companyId = userCompanyResult[0].companyId;

    const { rates, seeded } = await seedSelectedRatesForOfficer(user.id, companyId);

    return NextResponse.json(
      {
        success: true,
        seeded,
        message: seeded
          ? 'Default selected rates seeded successfully.'
          : 'All program buckets already have selected rates for this officer.',
        rates: rates.map(mapDbRow),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('❌ Error seeding default selected rates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed default selected rates',
      },
      { status: 500 },
    );
  }
}

