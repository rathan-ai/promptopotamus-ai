import { createServerClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function isAdmin(supabase: SupabaseClient): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        
        return profile?.role === 'admin';
    } catch (error) {

        return false;
    }
}

export async function getCurrentUser(supabase: SupabaseClient) {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
}

export async function getUserRole(supabase: SupabaseClient, userId: string): Promise<string | null> {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
        
        return profile?.role || null;
    } catch (error) {

        return null;
    }
}

export function constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }
    
    return crypto.timingSafeEqual(
        Buffer.from(a),
        Buffer.from(b)
    );
}