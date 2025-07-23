import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { triggerPasswordResetEmail } from '@/lib/email-triggers';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      // For security, don't reveal if email exists or not
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, you will receive a password reset link.'
      });
    }

    // Generate password reset using Supabase Auth
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (resetError) {
      console.error('Supabase password reset error:', resetError);
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    // Since Supabase handles the reset email, we can send our custom notification
    // Note: In production, you might want to customize the Supabase email template instead
    try {
      await triggerPasswordResetEmail(profile.id, profile.name, 'supabase-handled');
    } catch (emailError) {
      console.error('Custom email trigger error:', emailError);
      // Don't fail the request if custom email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent to your email address.'
    });

  } catch (error) {
    console.error('Password reset API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { password, access_token, refresh_token } = await request.json();

    if (!password || !access_token || !refresh_token) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Set the session with the tokens from the reset URL
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });

    if (sessionError) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      );
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}