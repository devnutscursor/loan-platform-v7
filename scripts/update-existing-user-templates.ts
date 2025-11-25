import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateExistingUserTemplates() {
  try {
    console.log('🚀 Updating existing users\' personal templates...');

    // Get all user personal templates (non-default templates)
    const { data: userTemplates, error: fetchError } = await supabase
      .from('templates')
      .select('*')
      .eq('is_default', false)
      .not('user_id', 'is', null)
      .in('slug', ['template1', 'template2']);

    if (fetchError) {
      console.error('❌ Error fetching user templates:', fetchError);
      return;
    }

    if (!userTemplates || userTemplates.length === 0) {
      console.log('⚠️ No user personal templates found');
      return;
    }

    console.log(`📋 Found ${userTemplates.length} user personal templates to update`);

    let template1Count = 0;
    let template2Count = 0;
    let errorCount = 0;

    for (const template of userTemplates) {
      try {
        const isTemplate1 = template.slug === 'template1';
        const isTemplate2 = template.slug === 'template2';

        if (!isTemplate1 && !isTemplate2) {
          continue;
        }

        // Prepare update data - preserve existing structure, only update colors and borderRadius
        const currentColors = template.colors || {};
        const currentLayout = template.layout || {};

        const updateData: any = {
          colors: {
            ...currentColors,
            primary: isTemplate1 ? '#064E3B' : '#374151',
            secondary: isTemplate1 ? '#D4AF37' : '#9CA3AF',
          },
          layout: {
            ...currentLayout,
            borderRadius: isTemplate1 ? 8 : 1,
          },
          updated_at: new Date().toISOString(),
        };

        const { data: updatedTemplate, error: updateError } = await supabase
          .from('templates')
          .update(updateData)
          .eq('id', template.id)
          .select()
          .single();

        if (updateError) {
          console.error(`❌ Error updating template ${template.id} (${template.slug}):`, updateError);
          errorCount++;
        } else {
          if (isTemplate1) {
            template1Count++;
            console.log(`✅ Updated template1 for user ${template.user_id}`);
          } else if (isTemplate2) {
            template2Count++;
            console.log(`✅ Updated template2 for user ${template.user_id}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing template ${template.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n🎉 Template update completed!');
    console.log(`✅ Updated template1: ${template1Count} templates`);
    console.log(`✅ Updated template2: ${template2Count} templates`);
    console.log(`❌ Errors: ${errorCount} templates`);

  } catch (error) {
    console.error('❌ Error in template update process:', error);
  }
}

// Run the script
updateExistingUserTemplates();

