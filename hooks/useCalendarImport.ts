import { useState, useCallback } from 'react';
import * as Calendar from 'expo-calendar';
import { Alert, Linking } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useBirthdays, Person } from './useBirthdays';

export interface CalendarBirthdayItem {
  eventId: string;
  name: string;
  birthday_month: number;
  birthday_day: number;
  birthday_year: number | null;
  isDuplicate: boolean;
}

export function useCalendarImport() {
  const { user } = useAuth();
  const { birthdays, refetch } = useBirthdays();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [calendarBirthdays, setCalendarBirthdays] = useState<CalendarBirthdayItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarBirthdays = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Calendar Access Required',
          'Please enable calendar access in Settings to import birthdays.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        setLoading(false);
        return false;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

      // Find the iOS Birthdays calendar
      const birthdayCalendar = calendars.find(
        (cal) =>
          cal.type === Calendar.CalendarType.BIRTHDAYS ||
          (cal.title === 'Birthdays' && cal.allowsModifications === false)
      );

      if (!birthdayCalendar) {
        setError('No Birthdays calendar found on this device.');
        setCalendarBirthdays([]);
        setLoading(false);
        return false;
      }

      // Fetch events across a wide range to capture all birthdays
      const startDate = new Date(2000, 0, 1);
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 2);

      const events = await Calendar.getEventsAsync(
        [birthdayCalendar.id],
        startDate,
        endDate
      );

      // Deduplicate by name (birthday calendar repeats events annually)
      const seen = new Map<string, CalendarBirthdayItem>();

      for (const event of events) {
        if (!event.title) continue;
        const name = event.title.trim();
        if (seen.has(name.toLowerCase())) continue;

        const eventDate = new Date(event.startDate);
        const month = eventDate.getMonth() + 1;
        const day = eventDate.getDate();
        const rawYear = eventDate.getFullYear();

        // iOS uses year 1604 as sentinel for unknown year
        const year = rawYear > 1900 && rawYear <= new Date().getFullYear() ? rawYear : null;

        // Check for duplicates against existing birthdays
        const isDuplicate = birthdays.some(
          (p: Person) =>
            p.name.toLowerCase() === name.toLowerCase() &&
            p.birthday_month === month &&
            p.birthday_day === day
        );

        seen.set(name.toLowerCase(), {
          eventId: event.id,
          name,
          birthday_month: month,
          birthday_day: day,
          birthday_year: year,
          isDuplicate,
        });
      }

      const items = Array.from(seen.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setCalendarBirthdays(items);
      setLoading(false);
      return items.length > 0;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to read calendar';
      setError(message);
      setLoading(false);
      return false;
    }
  }, [birthdays]);

  const importSelected = useCallback(
    async (selectedItems: CalendarBirthdayItem[]): Promise<number> => {
      if (!user || selectedItems.length === 0) return 0;
      setImporting(true);

      try {
        // Batch insert directly to avoid N refetches
        const rows = selectedItems.map((item) => ({
          user_id: user.id,
          name: item.name,
          birthday_day: item.birthday_day,
          birthday_month: item.birthday_month,
          birthday_year: item.birthday_year,
        }));

        const { error: insertError } = await supabase
          .from('people')
          .insert(rows);

        if (insertError) throw insertError;

        await refetch();
        setImporting(false);
        return selectedItems.length;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Import failed';
        setError(message);
        setImporting(false);
        throw err;
      }
    },
    [user, refetch]
  );

  const reset = useCallback(() => {
    setCalendarBirthdays([]);
    setError(null);
  }, []);

  return {
    loading,
    importing,
    calendarBirthdays,
    error,
    fetchCalendarBirthdays,
    importSelected,
    reset,
  };
}
