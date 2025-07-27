import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { triggerPasswordResetEmail } from '@/lib/email-triggers';
import { 
  successResponse, 
  validationErrorResponse, 
  errorResponse,
  withErrorHandling,
  validateRequest
} from '@/lib/api/response';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  access_token: z.string().min(1, 'Access token is required'),
  refresh_token: z.string().min(1, 'Refresh token is required')
});

async function postHandler(request: NextRequest) {
  const validation = await validateRequest(request, resetPasswordSchema);
  if (!validation.success) {
    return validation.response;
  }

  const { email } = validation.data;
  const supabase = await createServerClient();

  // Check if user exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('email', email)
    .single();

  if (profileError || !profile) {
    // For security, don't reveal if email exists or not
    return successResponse(
      undefined, 
      'If an account with that email exists, you will receive a password reset link.'
    );
  }

  // Generate password reset using Supabase Auth
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });

  if (resetError) {
    console.error('Supabase password reset error:', resetError);
    return errorResponse('Failed to send password reset email');
  }

  // Since Supabase handles the reset email, we can send our custom notification
  // Note: In production, you might want to customize the Supabase email template instead
  try {
    await triggerPasswordResetEmail(profile.id, profile.name, 'supabase-handled');
  } catch (emailError) {
    console.error('Custom email trigger error:', emailError);
    // Don't fail the request if custom email fails
  }

  return successResponse(undefined, 'Password reset link sent to your email address.');
}

async function putHandler(request: NextRequest) {
  const validation = await validateRequest(request, updatePasswordSchema);
  if (!validation.success) {
    return validation.response;
  }

  const { password, access_token, refresh_token } = validation.data;
  const supabase = await createServerClient();

  // Set the session with the tokens from the reset URL
  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token
  });

  if (sessionError) {
    return errorResponse('Invalid or expired reset link');
  }

  // Update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password: password
  });

  if (updateError) {
    return errorResponse('Failed to update password');
  }

  return successResponse(undefined, 'Password updated successfully');
}

export const POST = withErrorHandling(postHandler);
export const PUT = withErrorHandling(putHandler);