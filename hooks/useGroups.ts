import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Group {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  share_code: string | null;
  created_at: string;
  member_count?: number;
}

export interface GroupInput {
  name: string;
  color?: string | null;
}

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('groups')
        .select('*, person_groups(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mapped = (data ?? []).map((g: Record<string, unknown>) => ({
        ...g,
        member_count: Array.isArray(g.person_groups) && g.person_groups.length > 0
          ? (g.person_groups[0] as { count: number }).count
          : 0,
      })) as Group[];

      setGroups(mapped);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch groups';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const addGroup = useCallback(
    async (input: GroupInput) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('groups')
        .insert({
          user_id: user.id,
          name: input.name,
          color: input.color ?? null,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchGroups();
      return data;
    },
    [user, fetchGroups]
  );

  const updateGroup = useCallback(
    async (id: string, input: Partial<GroupInput>) => {
      const { error: updateError } = await supabase
        .from('groups')
        .update(input)
        .eq('id', id);
      if (updateError) throw updateError;
      await fetchGroups();
    },
    [fetchGroups]
  );

  const deleteGroup = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      await fetchGroups();
    },
    [fetchGroups]
  );

  const generateShareCode = useCallback(async (id: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const { error: updateError } = await supabase
      .from('groups')
      .update({ share_code: code })
      .eq('id', id);

    if (updateError) throw updateError;
    await fetchGroups();
    return code;
  }, [fetchGroups]);

  return {
    groups,
    loading,
    error,
    refetch: fetchGroups,
    addGroup,
    updateGroup,
    deleteGroup,
    generateShareCode,
  };
}
