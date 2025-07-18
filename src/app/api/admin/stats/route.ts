import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch stats in parallel
    const [
        { count: totalUsers, error: usersError },
        { count: totalCertificates, error: certsError }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_certificates').select('*', { count: 'exact', head: true })
    ]);

    if (usersError || certsError) {
        return NextResponse.json({ error: 'Failed to fetch admin stats.' }, { status: 500 });
    }

    return NextResponse.json({ totalUsers, totalCertificates });
}