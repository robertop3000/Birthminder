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
  const age = currentYear - year;

  // Check if birthday has already occurred this year
  const hasBirthdayPassedThisYear =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);

  return hasBirthdayPassedThisYear ? age : age - 1;
}

export function isBirthdayToday(month: number, day: number): boolean {
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  // Exact match for normal dates
  if (todayMonth === month && todayDay === day) {
    return true;
  }

  // Special case: Feb 29 birthday observed on Feb 28 in non-leap years
  if (month === 2 && day === 29) {
    const isLeapYear = new Date(today.getFullYear(), 2, 0).getDate() === 29;
    if (!isLeapYear && todayMonth === 2 && todayDay === 28) {
      return true;
    }
  }

  return false;
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
