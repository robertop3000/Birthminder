import {
  differenceInDays,
  format,
  setMonth,
  setDate,
  setYear,
  isToday,
  isBefore,
  addYears,
  startOfDay,
  isLeapYear,
} from 'date-fns';

export function getNextBirthday(month: number, day: number): Date {
  const today = startOfDay(new Date());
  const currentYear = today.getFullYear();

  let birthday = setDate(setMonth(new Date(currentYear, 0, 1), month - 1), day);
  birthday = startOfDay(birthday);

  // Handle Feb 29 in non-leap years
  if (month === 2 && day === 29 && !isLeapYear(new Date(currentYear, 0, 1))) {
    birthday = setDate(setMonth(new Date(currentYear, 0, 1), 1), 28);
    birthday = startOfDay(birthday);
  }

  if (isBefore(birthday, today) && !isToday(birthday)) {
    const nextYear = currentYear + 1;
    if (month === 2 && day === 29 && !isLeapYear(new Date(nextYear, 0, 1))) {
      birthday = startOfDay(setDate(setMonth(new Date(nextYear, 0, 1), 1), 28));
    } else {
      birthday = startOfDay(setDate(setMonth(new Date(nextYear, 0, 1), month - 1), day));
    }
  }

  return birthday;
}

export function getDaysUntilBirthday(month: number, day: number): number {
  const today = startOfDay(new Date());
  const next = getNextBirthday(month, day);

  if (isToday(next)) return 0;
  return differenceInDays(next, today);
}

export function getAge(
  year: number | null | undefined,
  month: number,
  day: number
): number | null {
  if (!year) return null;

  const today = new Date();
  const currentYear = today.getFullYear();
  const nextBirthday = getNextBirthday(month, day);
  const birthdayYear = nextBirthday.getFullYear();

  return birthdayYear - year;
}

export function isBirthdayToday(month: number, day: number): boolean {
  const today = new Date();
  return today.getMonth() + 1 === month && today.getDate() === day;
}

export function formatBirthdayDate(
  month: number,
  day: number,
  year?: number | null
): string {
  const date = setDate(setMonth(new Date(2000, 0, 1), month - 1), day);
  const monthDay = format(date, 'MMMM d');
  if (year) {
    return `${monthDay}, ${year}`;
  }
  return monthDay;
}
