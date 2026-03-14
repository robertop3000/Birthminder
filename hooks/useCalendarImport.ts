import { useState, useCallback } from 'react';
import * as Calendar from 'expo-calendar';
import { Alert, Linking } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useBirthdays, Person } from './useBirthdays';

export interface CalendarBirthdayItem {
  uid: string;
  eventId: string;
  name: string;
  birthday_month: number;
  birthday_day: number;
  birthday_year: number | null;
  isDuplicate: boolean;
}

export interface CalendarGroup {
  calendarId: string;
  calendarName: string;
  items: CalendarBirthdayItem[];
}

export function useCalendarImport() {
  const { user } = useAuth();
  const { birthdays, refetch } = useBirthdays();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [calendarGroups, setCalendarGroups] = useState<CalendarGroup[]>([]);
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

      if (calendars.length === 0) {
        setError('No calendars found on this device.');
        setCalendarGroups([]);
        setLoading(false);
        return false;
      }

      // Wide range for birthday calendars, 1-year window for others
      const birthdayStart = new Date(2000, 0, 1);
      const birthdayEnd = new Date();
      birthdayEnd.setFullYear(birthdayEnd.getFullYear() + 2);

      const regularStart = new Date();
      regularStart.setFullYear(regularStart.getFullYear() - 1);
      const regularEnd = new Date();
      regularEnd.setFullYear(regularEnd.getFullYear() + 1);

      const groups: CalendarGroup[] = [];
      let totalItems = 0;

      for (const cal of calendars) {
        const isBirthdayCal =
          cal.type === Calendar.CalendarType.BIRTHDAYS ||
          (cal.title === 'Birthdays' && cal.allowsModifications === false);

        const start = isBirthdayCal ? birthdayStart : regularStart;
        const end = isBirthdayCal ? birthdayEnd : regularEnd;

        const events = await Calendar.getEventsAsync([cal.id], start, end);

        // Deduplicate by name within each calendar
        const seen = new Map<string, Omit<CalendarBirthdayItem, 'uid'>>();

        for (const event of events) {
          if (!event.title) continue;
          const name = event.title.trim();
          if (!name) continue;
          if (seen.has(name.toLowerCase())) continue;

          const eventDate = new Date(event.startDate);
          const month = eventDate.getMonth() + 1;
          const day = eventDate.getDate();
          const rawYear = eventDate.getFullYear();

          // iOS uses year 1604 as sentinel for unknown year
          const year = rawYear > 1900 && rawYear <= new Date().getFullYear() ? rawYear : null;

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

        if (seen.size === 0) continue;

        const items: CalendarBirthdayItem[] = Array.from(seen.values())
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((item, index) => ({ ...item, uid: `${cal.id}-${item.eventId}-${index}` }));

        groups.push({
          calendarId: cal.id,
          calendarName: cal.title || 'Unnamed Calendar',
          items,
        });
        totalItems += items.length;
      }

      // Sort: Birthdays calendar first, then alphabetically
      groups.sort((a, b) => {
        const aIsBirthday = a.calendarName.toLowerCase() === 'birthdays';
        const bIsBirthday = b.calendarName.toLowerCase() === 'birthdays';
        if (aIsBirthday && !bIsBirthday) return -1;
        if (!aIsBirthday && bIsBirthday) return 1;
        return a.calendarName.localeCompare(b.calendarName);
      });

      setCalendarGroups(groups);
      setLoading(false);
      return totalItems > 0;
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
    setCalendarGroups([]);
    setError(null);
  }, []);

  return {
    loading,
    importing,
    calendarGroups,
    error,
    fetchCalendarBirthdays,
    importSelected,
    reset,
  };
}
