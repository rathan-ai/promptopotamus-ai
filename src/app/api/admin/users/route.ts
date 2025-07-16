import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

async function isAdmin(supabase: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    return profile?.role === 'admin';
}

export async function GET() {
    const supabase = createServerClient();
    if (!(await isAdmin(supabase))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Get all users from the auth system
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
        return NextResponse.json({ error: 'Failed to fetch auth users.' }, { status: 500 });
    }

    // 2. Get all profiles and their associated certificates
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            role,
            user_certificates ( id, certificate_slug, earned_at )
        `);

    if (profilesError) {
        return NextResponse.json({ error: 'Failed to fetch profiles.' }, { status: 500 });
    }
    
    // Create a Map for easy lookup of profiles
    const profilesMap = new Map(profiles.map(p => [p.id, p]));

    // 3. Combine the data robustly
    const combinedData = users.map(user => {
        const profile = profilesMap.get(user.id);
        return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            full_name: profile?.full_name || 'N/A',
            role: profile?.role || 'user',
            user_certificates: profile?.user_certificates || [],
        };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());


    return NextResponse.json(combinedData);
}