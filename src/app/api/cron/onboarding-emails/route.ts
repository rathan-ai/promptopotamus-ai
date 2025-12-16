import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { triggerOnboardingDay3Email, triggerOnboardingDay7Email } from '@/lib/email-triggers';

/**
 * Cron endpoint for sending onboarding email sequences
 *
 * This should be called daily by a cron job (e.g., Vercel Cron)
 * Schedule: 0 9 * * * (9 AM daily)
 *
 * Vercel cron config in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/onboarding-emails",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Allow in development or when secret matches
    if (process.env.NODE_ENV === 'production' && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerClient();
    const now = new Date();

    // Calculate date thresholds
    const day3Threshold = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const day3Start = new Date(day3Threshold.setHours(0, 0, 0, 0));
    const day3End = new Date(day3Threshold.setHours(23, 59, 59, 999));

    const day7Threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const day7Start = new Date(day7Threshold.setHours(0, 0, 0, 0));
    const day7End = new Date(day7Threshold.setHours(23, 59, 59, 999));

    const results = {
      day3: { processed: 0, sent: 0, skipped: 0 },
      day7: { processed: 0, sent: 0, skipped: 0 }
    };

    // Day 3 emails - users who signed up 3 days ago and haven't earned any certificate
    const { data: day3Users } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        name,
        email,
        created_at,
        user_certificates(id)
      `)
      .gte('created_at', day3Start.toISOString())
      .lte('created_at', day3End.toISOString());

    if (day3Users) {
      for (const user of day3Users) {
        results.day3.processed++;

        // Skip if user already has certificates
        const certificates = user.user_certificates as { id: number }[] | null;
        if (certificates && certificates.length > 0) {
          results.day3.skipped++;
          continue;
        }

        const userName = user.first_name || user.name || 'there';
        await triggerOnboardingDay3Email(user.id, userName);
        results.day3.sent++;

        // Small delay to avoid overwhelming email service
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Day 7 emails - users who signed up 7 days ago and haven't created any prompts
    const { data: day7Users } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        name,
        email,
        created_at,
        saved_prompts(id)
      `)
      .gte('created_at', day7Start.toISOString())
      .lte('created_at', day7End.toISOString());

    if (day7Users) {
      for (const user of day7Users) {
        results.day7.processed++;

        const prompts = user.saved_prompts as { id: number }[] | null;
        const hasPrompts = prompts && prompts.length > 0;

        if (hasPrompts) {
          results.day7.skipped++;
          continue;
        }

        const userName = user.first_name || user.name || 'there';
        await triggerOnboardingDay7Email(user.id, userName, false);
        results.day7.sent++;

        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results
    });

  } catch (error) {
    console.error('Onboarding emails cron error:', error);
    return NextResponse.json(
      { error: 'Failed to process onboarding emails' },
      { status: 500 }
    );
  }
}
