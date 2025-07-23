import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { serverUserProfileManager, ProfileUpdateData } from '@/lib/user-profiles-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || user.id;

    const profile = await serverUserProfileManager.getUserProfile(userId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bio, website, twitter_handle, linkedin_url, expertise_tags }: ProfileUpdateData = body;

    // Validate input
    if (website && !isValidUrl(website)) {
      return NextResponse.json(
        { error: 'Invalid website URL' },
        { status: 400 }
      );
    }

    if (linkedin_url && !isValidUrl(linkedin_url)) {
      return NextResponse.json(
        { error: 'Invalid LinkedIn URL' },
        { status: 400 }
      );
    }

    if (twitter_handle && !isValidTwitterHandle(twitter_handle)) {
      return NextResponse.json(
        { error: 'Invalid Twitter handle' },
        { status: 400 }
      );
    }

    if (expertise_tags && expertise_tags.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 expertise tags allowed' },
        { status: 400 }
      );
    }

    // Update profile
    const updatedProfile = await serverUserProfileManager.updateUserProfile(user.id, {
      bio: bio?.trim() || undefined,
      website: website?.trim() || undefined,
      twitter_handle: twitter_handle?.trim() || undefined,
      linkedin_url: linkedin_url?.trim() || undefined,
      expertise_tags: expertise_tags || undefined
    });

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

function isValidTwitterHandle(handle: string): boolean {
  const cleanHandle = handle.replace('@', '');
  return /^[A-Za-z0-9_]{1,15}$/.test(cleanHandle);
}