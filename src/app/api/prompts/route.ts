import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const MAX_PROMPTS = 10;

export async function POST(req: Request) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check current prompt count
    const { count, error: countError } = await supabase
        .from('saved_prompts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
    
    if (countError) {
        return NextResponse.json({ error: 'Could not verify prompt count.' }, { status: 500 });
    }

    if (count !== null && count >= MAX_PROMPTS) {
        return NextResponse.json({ error: `You have reached the limit of ${MAX_PROMPTS} saved prompts.` }, { status: 403 });
    }

    // Insert new prompt
    const promptData = await req.json();
    const { error: insertError } = await supabase
        .from('saved_prompts')
        .insert({ ...promptData, user_id: user.id });

    if (insertError) {
        return NextResponse.json({ error: `Failed to save prompt. Details: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Prompt saved successfully!' });
}