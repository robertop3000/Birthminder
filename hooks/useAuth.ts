import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Ensures a profile row exists for the given user.
 * Called on every SIGNED_IN event as a safety net.
 */
async function ensureProfile(user: User) {
  // Check if profile already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (existing) return; // Profile exists, nothing to do

  // Profile missing — create it using metadata or fallback
  const displayName =
    user.user_metadata?.display_name ||
    user.email?.split('@')[0] ||
    'User';

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    display_name: displayName,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  });

  if (error) {
    console.warn('ensureProfile insert failed:', error.message);
  }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Ensure profile exists for already-signed-in users
      if (session?.user) {
        ensureProfile(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Ensure profile exists whenever user signs in
      if (event === 'SIGNED_IN' && session?.user) {
        ensureProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      avatarUrl?: string | null
    ) => {
      // Store displayName in user metadata so ensureProfile can use it
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            avatar_url: avatarUrl ?? null,
          },
        },
      });
      if (error) throw error;

      // Try to insert profile immediately (may fail if RLS blocks it)
      if (data.user) {
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            display_name: displayName,
            avatar_url: avatarUrl ?? null,
          });
        } catch (profileErr) {
          // Not critical — ensureProfile will retry on next SIGNED_IN event
          console.warn('Immediate profile insert failed, will retry:', profileErr);
        }
      }

      return data;
    },
    []
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  return { session, user, loading, signUp, signIn, signOut, resetPassword };
}
