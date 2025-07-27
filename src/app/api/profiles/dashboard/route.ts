import { createServerClient } from '@/lib/supabase/server';
import { 
  successResponse, 
  unauthorizedResponse, 
  errorResponse,
  withErrorHandling 
} from '@/lib/api/response';

async function dashboardHandler() {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return unauthorizedResponse();
    }

    // Fetch all necessary data for the dashboard in parallel
    const [
        { data: attempts, error: attemptsError },
        { data: prompts, error: promptsError },
        { data: certificates, error: certsError },
        { data: profile, error: profileError }
    ] = await Promise.all([
        supabase.from('quiz_attempts').select('*').eq('user_id', user.id).order('attempted_at', { ascending: false }),
        supabase.from('saved_prompts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('user_certificates').select('*').eq('user_id', user.id).order('earned_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', user.id).single()
    ]);

    if (attemptsError || promptsError || certsError || profileError) {
        console.error('Dashboard data fetch errors:', { attemptsError, promptsError, certsError, profileError });
        return errorResponse('Failed to fetch dashboard data');
    }

    return successResponse({
        attempts: attempts || [],
        prompts: prompts || [],
        certificates: certificates || [],
        profile
    });
}

export const GET = withErrorHandling(dashboardHandler);