import { createServerClient } from '@/lib/supabase/server';
import { 
  successResponse, 
  unauthorizedResponse, 
  errorResponse,
  withErrorHandling 
} from '@/lib/api/response';

async function dashboardHandler() {
    console.log('[API Dashboard Debug] Step 1: Handler started');
    const supabase = await createServerClient();

    console.log('[API Dashboard Debug] Step 2: Getting user');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('[API Dashboard Debug] Step 3: Auth result:', {
        hasUser: !!user,
        userId: user?.id,
        authError: authError?.message
    });

    if (!user) {
        console.log('[API Dashboard Debug] No user - returning 401');
        return unauthorizedResponse();
    }

    // Fetch all necessary data for the dashboard in parallel
    console.log('[API Dashboard Debug] Step 4: Fetching data for user:', user.id);
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

    console.log('[API Dashboard Debug] Step 5: Query results:', {
        attemptsCount: attempts?.length,
        attemptsError: attemptsError?.message,
        promptsCount: prompts?.length,
        promptsError: promptsError?.message,
        certsCount: certificates?.length,
        certsError: certsError?.message,
        hasProfile: !!profile,
        profileError: profileError?.message
    });

    if (attemptsError || promptsError || certsError || profileError) {
        console.error('[API Dashboard Debug] Data fetch errors:', { attemptsError, promptsError, certsError, profileError });
        return errorResponse('Failed to fetch dashboard data');
    }

    console.log('[API Dashboard Debug] Step 6: Returning success response');
    return successResponse({
        attempts: attempts || [],
        prompts: prompts || [],
        certificates: certificates || [],
        profile
    });
}

export const GET = withErrorHandling(dashboardHandler);