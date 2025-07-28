import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if current user is admin
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you can adjust this check based on your admin logic)
    const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

    if (!profile || profile.email !== 'rathan@innorag.com') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    try {
        const { email } = await req.json();
        
        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Get target user ID
        const { data: targetUser, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const targetUserId = targetUser.id;
        console.log(`Resetting exam status for user ${email} (ID: ${targetUserId})`);

        // Delete quiz attempts
        const { error: quizError } = await supabase
            .from('quiz_attempts')
            .delete()
            .eq('user_id', targetUserId);

        if (quizError) {
            console.error('Error deleting quiz attempts:', quizError);
        }

        // Delete certifications
        const { error: certError } = await supabase
            .from('certifications')
            .delete()
            .eq('user_id', targetUserId);

        if (certError) {
            console.error('Error deleting certifications:', certError);
        }

        // Delete certificate views
        const { error: viewError } = await supabase
            .from('certificate_views')
            .delete()
            .eq('viewer_id', targetUserId);

        if (viewError) {
            console.error('Error deleting certificate views:', viewError);
        }

        // Delete certification achievements
        const { error: achievementError } = await supabase
            .from('achievements')
            .delete()
            .eq('user_id', targetUserId)
            .in('achievement_type', [
                'first_certification', 
                'all_certifications', 
                'certification_beginner', 
                'certification_intermediate', 
                'certification_master'
            ]);

        if (achievementError) {
            console.error('Error deleting achievements:', achievementError);
        }

        // Get counts for verification
        const { count: quizCount } = await supabase
            .from('quiz_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', targetUserId);

        const { count: certCount } = await supabase
            .from('certifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', targetUserId);

        return NextResponse.json({ 
            message: `Successfully reset exam status for ${email}`,
            deleted: {
                quiz_attempts: quizCount === 0 ? 'All deleted' : `${quizCount} remaining`,
                certifications: certCount === 0 ? 'All deleted' : `${certCount} remaining`
            }
        });

    } catch (error) {
        console.error('Error resetting exam status:', error);
        return NextResponse.json({ error: 'Failed to reset exam status' }, { status: 500 });
    }
}