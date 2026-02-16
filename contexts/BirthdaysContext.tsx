import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export interface PersonGroup {
    group_id: string;
    groups: {
        id: string;
        name: string;
        color: string | null;
    };
}

export interface Person {
    id: string;
    user_id: string;
    name: string;
    birthday_day: number;
    birthday_month: number;
    birthday_year: number | null;
    photo_url: string | null;
    notes: string | null;
    share_code: string | null;
    created_at: string;
    person_groups: PersonGroup[];
}

export interface BirthdayInput {
    name: string;
    birthday_day: number;
    birthday_month: number;
    birthday_year?: number | null;
    photo_url?: string | null;
    notes?: string | null;
    group_ids?: string[];
}

interface BirthdaysContextValue {
    birthdays: Person[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    addBirthday: (input: BirthdayInput) => Promise<Person | null>;
    updateBirthday: (id: string, input: Partial<BirthdayInput>) => Promise<void>;
    deleteBirthday: (id: string) => Promise<void>;
    generatePersonShareCode: (id: string) => Promise<string>;
}

const BirthdaysContext = createContext<BirthdaysContextValue | null>(null);

export function BirthdaysProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [birthdays, setBirthdays] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBirthdays = useCallback(async () => {
        if (!user) {
            setBirthdays([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('people')
                .select('*, person_groups(group_id, groups(id, name, color))')
                .eq('user_id', user.id)
                .order('birthday_month', { ascending: true })
                .order('birthday_day', { ascending: true });

            if (fetchError) throw fetchError;
            setBirthdays((data as Person[]) ?? []);
            setError(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch birthdays';
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBirthdays();
    }, [fetchBirthdays]);

    const addBirthday = useCallback(
        async (input: BirthdayInput): Promise<Person | null> => {
            if (!user) throw new Error('Not authenticated');

            const { data, error: insertError } = await supabase
                .from('people')
                .insert({
                    user_id: user.id,
                    name: input.name,
                    birthday_day: input.birthday_day,
                    birthday_month: input.birthday_month,
                    birthday_year: input.birthday_year ?? null,
                    photo_url: input.photo_url ?? null,
                    notes: input.notes ?? null,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            if (input.group_ids && input.group_ids.length > 0 && data) {
                const rows = input.group_ids.map((gid) => ({
                    person_id: data.id,
                    group_id: gid,
                }));
                await supabase.from('person_groups').insert(rows);
            }

            await fetchBirthdays();
            return data;
        },
        [user, fetchBirthdays]
    );

    const updateBirthday = useCallback(
        async (id: string, input: Partial<BirthdayInput>) => {
            if (!user) throw new Error('Not authenticated');

            const updateData: Record<string, unknown> = {};
            if (input.name !== undefined) updateData.name = input.name;
            if (input.birthday_day !== undefined) updateData.birthday_day = input.birthday_day;
            if (input.birthday_month !== undefined) updateData.birthday_month = input.birthday_month;
            if (input.birthday_year !== undefined) updateData.birthday_year = input.birthday_year;
            if (input.photo_url !== undefined) updateData.photo_url = input.photo_url;
            if (input.notes !== undefined) updateData.notes = input.notes;

            if (Object.keys(updateData).length > 0) {
                const { error: updateError } = await supabase
                    .from('people')
                    .update(updateData)
                    .eq('id', id);
                if (updateError) throw updateError;
            }

            if (input.group_ids !== undefined) {
                await supabase.from('person_groups').delete().eq('person_id', id);
                if (input.group_ids.length > 0) {
                    const rows = input.group_ids.map((gid) => ({
                        person_id: id,
                        group_id: gid,
                    }));
                    await supabase.from('person_groups').insert(rows);
                }
            }

            await fetchBirthdays();
        },
        [user, fetchBirthdays]
    );

    const deleteBirthday = useCallback(
        async (id: string) => {
            const { error: deleteError } = await supabase
                .from('people')
                .delete()
                .eq('id', id);
            if (deleteError) throw deleteError;
            await fetchBirthdays();
        },
        [fetchBirthdays]
    );

    const generatePersonShareCode = useCallback(async (id: string) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const { error: updateError } = await supabase
            .from('people')
            .update({ share_code: code })
            .eq('id', id);

        if (updateError) throw updateError;
        await fetchBirthdays();
        return code;
    }, [fetchBirthdays]);

    return (
        <BirthdaysContext.Provider
            value={{
                birthdays,
                loading,
                error,
                refetch: fetchBirthdays,
                addBirthday,
                updateBirthday,
                deleteBirthday,
                generatePersonShareCode,
            }}
        >
            {children}
        </BirthdaysContext.Provider>
    );
}

export function useBirthdaysContext(): BirthdaysContextValue {
    const context = useContext(BirthdaysContext);
    if (!context) {
        throw new Error('useBirthdaysContext must be used within a BirthdaysProvider');
    }
    return context;
}
