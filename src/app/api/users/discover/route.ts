import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { serverUserProfileManager } from '@/lib/user-profiles-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'popular', 'suggested', 'search'
    const query = searchParams.get('query'); // For search
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    switch (type) {
      case 'popular':
        const popularUsers = await serverUserProfileManager.getPopularUsers(limit, offset);
        return NextResponse.json({
          success: true,
          users: popularUsers,
          type: 'popular'
        });

      case 'suggested':
        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required for suggestions' },
            { status: 401 }
          );
        }
        
        const suggestedUsers = await serverUserProfileManager.getSuggestedUsers(user.id, limit);
        return NextResponse.json({
          success: true,
          users: suggestedUsers,
          type: 'suggested'
        });

      case 'search':
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter required for search' },
            { status: 400 }
          );
        }

        const searchResults = await serverUserProfileManager.searchUsers(query, limit, offset);
        return NextResponse.json({
          success: true,
          users: searchResults,
          type: 'search',
          query
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter. Must be "popular", "suggested", or "search"' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('User discovery API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}