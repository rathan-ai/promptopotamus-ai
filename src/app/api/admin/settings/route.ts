import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET - Fetch admin settings
export async function GET(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check admin privileges using profiles table
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('admin_settings')
      .select('category, key, value, description, data_type, updated_at')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: settings, error } = await query.order('category').order('key');

    if (error) {
      console.error('Error fetching admin settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Group settings by category for easier frontend handling
    const groupedSettings: Record<string, any> = {};
    settings?.forEach(setting => {
      if (!groupedSettings[setting.category]) {
        groupedSettings[setting.category] = {};
      }
      groupedSettings[setting.category][setting.key] = {
        value: setting.value,
        description: setting.description,
        data_type: setting.data_type,
        updated_at: setting.updated_at
      };
    });

    return NextResponse.json({ 
      success: true, 
      settings: groupedSettings,
      raw: settings // Also provide raw format for specific use cases
    });

  } catch (error) {
    console.error('Error in admin settings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update admin settings
export async function PUT(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check admin privileges using profiles table
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { category, key, value, description } = await req.json();

    if (!category || !key || value === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: category, key, and value are required' 
      }, { status: 400 });
    }

    const updateData: any = {
      value: typeof value === 'object' ? value : JSON.parse(JSON.stringify(value)),
      updated_at: new Date().toISOString(),
      updated_by: user.id
    };

    if (description) {
      updateData.description = description;
    }

    const { data, error } = await supabase
      .from('admin_settings')
      .update(updateData)
      .eq('category', category)
      .eq('key', key)
      .select();

    if (error) {
      console.error('Error updating admin setting:', error);
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Setting updated successfully',
      setting: data[0]
    });

  } catch (error) {
    console.error('Error in admin settings update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new admin setting
export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check admin privileges using profiles table
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { category, key, value, description, data_type = 'string' } = await req.json();

    if (!category || !key || value === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: category, key, and value are required' 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('admin_settings')
      .insert({
        category,
        key,
        value: typeof value === 'object' ? value : JSON.parse(JSON.stringify(value)),
        description,
        data_type,
        created_at: new Date().toISOString(),
        updated_by: user.id
      })
      .select();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ 
          error: 'Setting already exists for this category and key' 
        }, { status: 409 });
      }
      console.error('Error creating admin setting:', error);
      return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Setting created successfully',
      setting: data[0]
    });

  } catch (error) {
    console.error('Error in admin settings creation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}