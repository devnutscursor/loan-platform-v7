import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { companies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireSuperAdmin } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Check if company exists
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company.length) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (company[0].deactivated) {
      return NextResponse.json({ error: 'Company is already deactivated' }, { status: 400 });
    }

    // Deactivate the company
    await db
      .update(companies)
      .set({ 
        deactivated: true,
        updatedAt: new Date()
      })
      .where(eq(companies.id, companyId));

    return NextResponse.json({ 
      success: true, 
      message: 'Company deactivated successfully' 
    });

  } catch (error) {
    console.error('Error deactivating company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}