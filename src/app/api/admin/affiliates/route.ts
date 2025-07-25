import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';

// GET - Fetch all affiliate resources
export async function GET() {
    const supabase = await createServerClient();
    if (!(await isAdmin(supabase))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: affiliates, error } = await supabase
        .from('affiliate_resources')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        return NextResponse.json({ error: `Failed to fetch affiliates: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json(affiliates);
}

// POST - Create new affiliate resource
export async function POST(request: Request) {
    const supabase = await createServerClient();
    if (!(await isAdmin(supabase))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            name,
            provider,
            description,
            price,
            category,
            badge,
            color,
            icon,
            affiliate_link,
            features,
            rating,
            display_order,
            is_active
        } = body;

        // Validate required fields
        if (!name || !provider || !affiliate_link) {
            return NextResponse.json({ 
                error: 'Missing required fields: name, provider, affiliate_link' 
            }, { status: 400 });
        }

        // Validate URL format
        try {
            new URL(affiliate_link);
        } catch {
            return NextResponse.json({ 
                error: 'Invalid affiliate_link URL format' 
            }, { status: 400 });
        }

        const { data: affiliate, error } = await supabase
            .from('affiliate_resources')
            .insert([{
                name,
                provider,
                description,
                price,
                category,
                badge,
                color,
                icon,
                affiliate_link,
                features: Array.isArray(features) ? features : [],
                rating: rating || 5.0,
                display_order: display_order || 0,
                is_active: is_active !== false
            }])
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: `Failed to create affiliate: ${error.message}` }, { status: 500 });
        }

        return NextResponse.json({ message: 'Affiliate created successfully', affiliate }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ 
            error: `Invalid request body: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }, { status: 400 });
    }
}

// PUT - Update affiliate resource
export async function PUT(request: Request) {
    const supabase = await createServerClient();
    if (!(await isAdmin(supabase))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing affiliate ID' }, { status: 400 });
        }

        // Validate URL format if affiliate_link is being updated
        if (updateData.affiliate_link) {
            try {
                new URL(updateData.affiliate_link);
            } catch {
                return NextResponse.json({ 
                    error: 'Invalid affiliate_link URL format' 
                }, { status: 400 });
            }
        }

        const { data: affiliate, error } = await supabase
            .from('affiliate_resources')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: `Failed to update affiliate: ${error.message}` }, { status: 500 });
        }

        return NextResponse.json({ message: 'Affiliate updated successfully', affiliate });
    } catch (error) {
        return NextResponse.json({ 
            error: `Invalid request body: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }, { status: 400 });
    }
}

// DELETE - Delete affiliate resource
export async function DELETE(request: Request) {
    const supabase = await createServerClient();
    if (!(await isAdmin(supabase))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing affiliate ID' }, { status: 400 });
        }

        const { error } = await supabase
            .from('affiliate_resources')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: `Failed to delete affiliate: ${error.message}` }, { status: 500 });
        }

        return NextResponse.json({ message: 'Affiliate deleted successfully' });
    } catch (error) {
        return NextResponse.json({ 
            error: `Invalid request: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }, { status: 400 });
    }
}