#!/usr/bin/env node

/**
 * Migration script to convert existing Optimal Blue data to Mortech format
 * Run with: npx tsx scripts/migrate-ob-to-mortech.ts
 */

import { config } from 'dotenv';
import { db } from '../src/lib/db';
import { leads } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

// Load environment variables
config({ path: '.env.local' });

interface OptimalBlueLeadData {
  id: string;
  loanDetails: {
    productId?: string;
    lenderName?: string;
    loanProgram?: string;
    loanType?: string;
    loanTerm?: string;
    interestRate?: number;
    apr?: number;
    monthlyPayment?: number;
    fees?: number;
    points?: number;
    credits?: number;
    lockPeriod?: number;
  };
}

interface MortechLeadData {
  id: string;
  loanDetails: {
    productId: string;
    lenderName: string;
    loanProgram: string;
    loanType: string;
    loanTerm: string;
    interestRate: number;
    apr: number;
    monthlyPayment: number;
    originationFee: number;
    upfrontFee: number;
    monthlyPremium: number;
    points: number;
    credits: number;
    lockPeriod: number;
    fees: Array<{
      description: string;
      amount: number;
      section: string;
      paymentType: string;
      prepaid: boolean;
    }>;
    eligibility: {
      eligibilityCheck: string;
      comments: string;
    };
  };
}

async function migrateOptimalBlueDataToMortech() {
  console.log('🔄 Starting Optimal Blue to Mortech data migration...\n');

  try {
    // Fetch all leads with Optimal Blue loan details
    const allLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.source, 'rate_table'));

    console.log(`📊 Found ${allLeads.length} leads with rate_table source`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const lead of allLeads) {
      try {
        const loanDetails = lead.loanDetails as any;
        
        if (!loanDetails || !loanDetails.lenderName) {
          console.log(`⏭️ Skipping lead ${lead.id} - no loan details`);
          skippedCount++;
          continue;
        }

        // Check if this is Optimal Blue format data
        const isOptimalBlueFormat = loanDetails.lenderName && 
          (loanDetails.lenderName.includes('Optimal Blue') || 
           loanDetails.lenderName.includes('Mock Lender') ||
           loanDetails.productId === '99999999' ||
           loanDetails.productId === '99999998');

        if (!isOptimalBlueFormat) {
          console.log(`⏭️ Skipping lead ${lead.id} - not Optimal Blue format`);
          skippedCount++;
          continue;
        }

        // Transform Optimal Blue data to Mortech format
        const mortechLoanDetails = {
          productId: loanDetails.productId || lead.id,
          lenderName: loanDetails.lenderName,
          loanProgram: loanDetails.loanProgram || 'Conventional',
          loanType: loanDetails.loanType || 'Fixed',
          loanTerm: loanDetails.loanTerm || '30',
          interestRate: loanDetails.interestRate || 6.0,
          apr: loanDetails.apr || 6.1,
          monthlyPayment: loanDetails.monthlyPayment || 2000,
          originationFee: 0, // Not available in OB format
          upfrontFee: 0, // Not available in OB format
          monthlyPremium: 0, // Not available in OB format
          points: loanDetails.points || 0,
          credits: loanDetails.credits || 0,
          lockPeriod: loanDetails.lockPeriod || 30,
          fees: [
            {
              description: 'Closing Costs',
              amount: loanDetails.fees || 0,
              section: 'Other Costs',
              paymentType: 'Borrower-Paid At Closing',
              prepaid: false
            }
          ],
          eligibility: {
            eligibilityCheck: 'Pass',
            comments: 'Migrated from Optimal Blue'
          }
        };

        // Update the lead with Mortech format data
        await db
          .update(leads)
          .set({
            loanDetails: mortechLoanDetails,
            updatedAt: new Date(),
          })
          .where(eq(leads.id, lead.id));

        console.log(`✅ Migrated lead ${lead.id} from Optimal Blue to Mortech format`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error migrating lead ${lead.id}:`, error);
        skippedCount++;
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} leads`);
    console.log(`⏭️ Skipped: ${skippedCount} leads`);
    console.log(`📊 Total processed: ${migratedCount + skippedCount} leads`);

    if (migratedCount > 0) {
      console.log('\n💡 Next Steps:');
      console.log('1. Test the migrated data in your application');
      console.log('2. Verify that rate displays work correctly');
      console.log('3. Update any cached data if necessary');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

// Run the migration
if (require.main === module) {
  migrateOptimalBlueDataToMortech()
    .then(() => {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}
export { migrateOptimalBlueDataToMortech };





