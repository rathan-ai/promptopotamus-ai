import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { serverUserProfileManager } from '@/lib/user-profiles-server';

export async function POST(request: NextRequest) {
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
    const { targetUserId, action } = body;

    if (!targetUserId || !action) {
      return NextResponse.json(
        { error: 'Missing required parameters: targetUserId, action' },
        { status: 400 }
      );
    }

    if (action !== 'follow' && action !== 'unfollow') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "follow" or "unfollow"' },
        { status: 400 }
      );
    }

    if (user.id === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if target user exists
    const targetProfile = await serverUserProfileManager.getUserProfile(targetUserId);
    if (!targetProfile) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }

    let success = false;
    
    if (action === 'follow') {
      success = await serverUserProfileManager.followUser(user.id, targetUserId);
    } else {
      success = await serverUserProfileManager.unfollowUser(user.id, targetUserId);
    }

    if (!success) {
      return NextResponse.json(
        { error: `Failed to ${action} user` },
        { status: 500 }
      );
    }

    // Get updated follow status
    const isFollowing = await serverUserProfileManager.isFollowing(user.id, targetUserId);
    
    return NextResponse.json({
      success: true,
      action,
      isFollowing,
      targetUserId
    });

  } catch (error) {
    console.error('Follow API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const targetUserId = searchParams.get('targetUserId');
    const type = searchParams.get('type'); // 'followers', 'following', or 'status'
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Missing targetUserId parameter' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'followers':
        const followers = await serverUserProfileManager.getUserFollowers(targetUserId, limit, offset);
        return NextResponse.json({
          success: true,
          followers,
          count: followers.length
        });

      case 'following':
        const following = await serverUserProfileManager.getUserFollowing(targetUserId, limit, offset);
        return NextResponse.json({
          success: true,
          following,
          count: following.length
        });

      case 'status':
        const isFollowing = await serverUserProfileManager.isFollowing(user.id, targetUserId);
        return NextResponse.json({
          success: true,
          isFollowing,
          targetUserId
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter. Must be "followers", "following", or "status"' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Follow status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}