import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isAdmin, getCurrentUser } from '@/lib/auth';

export async function GET() {
  const supabase = await createServerClient();
  
  try {
    const user = await getCurrentUser(supabase);
    
    if (!user) {
      return NextResponse.json({ 
        isAuthenticated: false, 
        isAdmin: false,
        user: null 
      });
    }
    
    const adminStatus = await isAdmin(supabase);
    
    // Also get the profile role directly
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', user.id)
      .single();
    
    return NextResponse.json({ 
      isAuthenticated: true,
      isAdmin: adminStatus,
      user: {
        id: user.id,
        email: user.email,
        profile: profile
      }
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      isAuthenticated: false,
      isAdmin: false 
    }, { status: 500 });
  }
}