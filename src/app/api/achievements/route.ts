import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { serverAchievementEngine } from '@/lib/achievements-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || user?.id;
    const type = searchParams.get('type'); // 'earned', 'available', 'progress'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'earned':
        const earnedAchievements = await serverAchievementEngine.getUserAchievements(userId);
        return NextResponse.json({
          success: true,
          achievements: earnedAchievements,
          type: 'earned'
        });

      case 'available':
        // Get all achievements and mark which are earned
        const { data: allAchievements, error: achievementError } = await supabase
          .from('achievement_definitions')
          .select('*')
          .eq('is_active', true)
          .order('category', { ascending: true });

        if (achievementError) {
          return NextResponse.json(
            { error: 'Failed to fetch achievements' },
            { status: 500 }
          );
        }

        const { data: userAchievements } = await supabase
          .from('user_achievements')
          .select('achievement_id, earned_at')
          .eq('user_id', userId);

        const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
        const earnedMap = new Map(
          userAchievements?.map(ua => [ua.achievement_id, ua.earned_at]) || []
        );

        const availableAchievements = allAchievements?.map(achievement => ({
          ...achievement,
          earned: earnedIds.has(achievement.id),
          earned_at: earnedMap.get(achievement.id) || null
        })) || [];

        return NextResponse.json({
          success: true,
          achievements: availableAchievements,
          type: 'available'
        });

      case 'progress':
        const userXP = await serverAchievementEngine.getUserExperience(userId);
        const progress = userXP ? serverAchievementEngine.getCurrentLevelProgress(
          userXP.total_xp,
          userXP.current_level
        ) : null;

        // Get streak information
        const { data: streaks } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', userId);

        return NextResponse.json({
          success: true,
          experience: userXP,
          progress,
          streaks: streaks || [],
          type: 'progress'
        });

      default:
        // Default: return user's earned achievements
        const defaultAchievements = await serverAchievementEngine.getUserAchievements(userId);
        return NextResponse.json({
          success: true,
          achievements: defaultAchievements
        });
    }

  } catch (error) {
    console.error('Achievements API error:', error);
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
    const { action, points, category, context, metadata } = body;

    if (action === 'award_xp') {
      if (!points || !category || !context) {
        return NextResponse.json(
          { error: 'Missing required parameters: points, category, context' },
          { status: 400 }
        );
      }

      const result = await serverAchievementEngine.awardXP(
        user.id,
        points,
        category,
        context,
        metadata
      );

      return NextResponse.json({
        success: true,
        newLevel: result.newLevel,
        achievements: result.achievements,
        action: 'award_xp'
      });
    }

    if (action === 'update_streak') {
      const { streakType } = body;
      
      if (!streakType) {
        return NextResponse.json(
          { error: 'Missing required parameter: streakType' },
          { status: 400 }
        );
      }

      const newStreakCount = await serverAchievementEngine.updateStreak(
        user.id,
        streakType
      );

      // Check for streak achievements
      const streakAchievements = await serverAchievementEngine.checkAchievements(
        user.id,
        {
          context: 'streak_updated',
          metadata: { streakType, streakCount: newStreakCount }
        }
      );

      return NextResponse.json({
        success: true,
        streakCount: newStreakCount,
        achievements: streakAchievements,
        action: 'update_streak'
      });
    }

    if (action === 'check_achievements') {
      const achievements = await serverAchievementEngine.checkAchievements(
        user.id,
        { context: context || 'manual_check', metadata }
      );

      return NextResponse.json({
        success: true,
        achievements,
        action: 'check_achievements'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Achievements POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}