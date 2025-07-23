import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { serverPromptComments, CommentInput } from '@/lib/prompt-comments-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const searchParams = request.nextUrl.searchParams;
    const promptId = searchParams.get('promptId');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action'); // 'comments', 'count', 'user_comments', 'search', 'stats'
    const searchQuery = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    switch (action) {
      case 'comments':
        if (!promptId) {
          return NextResponse.json(
            { error: 'promptId parameter required' },
            { status: 400 }
          );
        }

        const comments = await serverPromptComments.getPromptComments(
          promptId,
          user?.id,
          limit,
          offset
        );

        return NextResponse.json({
          success: true,
          comments,
          promptId
        });

      case 'count':
        if (!promptId) {
          return NextResponse.json(
            { error: 'promptId parameter required' },
            { status: 400 }
          );
        }

        const count = await serverPromptComments.getCommentCount(promptId);

        return NextResponse.json({
          success: true,
          count,
          promptId
        });

      case 'user_comments':
        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        const targetUserId = userId || user.id;
        const userComments = await serverPromptComments.getUserComments(
          targetUserId,
          limit,
          offset
        );

        return NextResponse.json({
          success: true,
          comments: userComments,
          userId: targetUserId
        });

      case 'search':
        if (!promptId || !searchQuery) {
          return NextResponse.json(
            { error: 'promptId and q parameters required for search' },
            { status: 400 }
          );
        }

        const searchResults = await serverPromptComments.searchComments(
          promptId,
          searchQuery,
          user?.id,
          limit
        );

        return NextResponse.json({
          success: true,
          comments: searchResults,
          query: searchQuery,
          promptId
        });

      case 'stats':
        // Admin only
        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role !== 'admin') {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          );
        }

        const stats = await serverPromptComments.getCommentStats();

        return NextResponse.json({
          success: true,
          stats
        });

      case 'recent':
        // Admin only - recent comment activity
        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (adminProfile?.role !== 'admin') {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          );
        }

        const recentActivity = await serverPromptComments.getRecentCommentActivity(limit);

        return NextResponse.json({
          success: true,
          comments: recentActivity
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Comments GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { prompt_id, comment_text, parent_comment_id }: CommentInput = body;

    if (!prompt_id || !comment_text?.trim()) {
      return NextResponse.json(
        { error: 'Missing required parameters: prompt_id, comment_text' },
        { status: 400 }
      );
    }

    // Check if user can comment on this prompt
    const canComment = await serverPromptComments.canUserComment(user.id, prompt_id);
    if (!canComment) {
      return NextResponse.json(
        { error: 'You must purchase this prompt to comment' },
        { status: 403 }
      );
    }

    const newComment = await serverPromptComments.addComment(user.id, {
      prompt_id,
      comment_text: comment_text.trim(),
      parent_comment_id: parent_comment_id || undefined
    });

    if (!newComment) {
      return NextResponse.json(
        { error: 'Failed to add comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comment: newComment
    });

  } catch (error) {
    console.error('Comments POST API error:', error);
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
    const { comment_id, comment_text } = body;

    if (!comment_id || !comment_text?.trim()) {
      return NextResponse.json(
        { error: 'Missing required parameters: comment_id, comment_text' },
        { status: 400 }
      );
    }

    const updatedComment = await serverPromptComments.updateComment(
      comment_id,
      user.id,
      comment_text.trim()
    );

    if (!updatedComment) {
      return NextResponse.json(
        { error: 'Failed to update comment or not authorized' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comment: updatedComment
    });

  } catch (error) {
    console.error('Comments PUT API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: 'commentId parameter required' },
        { status: 400 }
      );
    }

    const success = await serverPromptComments.deleteComment(commentId, user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete comment or not authorized' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      commentId
    });

  } catch (error) {
    console.error('Comments DELETE API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}