import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
        first_name,
        last_name,
        age,
        gender,
        region,
        education
    } = await req.json();

    const { error } = await supabase
        .from('profiles')
        .update({
            first_name,
            last_name,
            age,
            gender,
            region,
            education,
            // Combine first and last name for the full_name column
            full_name: `${first_name || ''} ${last_name || ''}`.trim()
        })
        .eq('id', user.id);

    if (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully!' });
}