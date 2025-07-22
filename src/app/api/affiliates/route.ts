import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Fetch active affiliate resources for public use
export async function GET() {
    const supabase = await createServerClient();

    const { data: affiliates, error } = await supabase
        .from('affiliate_resources')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) {
        return NextResponse.json({ error: `Failed to fetch affiliates: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json(affiliates);
}