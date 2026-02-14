import {
  getDaysUntilBirthday,
  getAge,
  isBirthdayToday,
  formatBirthdayDate,
  getNextBirthday,
} from '../dateHelpers';

describe('dateHelpers', () => {
  describe('formatBirthdayDate', () => {
    it('formats month and day correctly', () => {
      expect(formatBirthdayDate(1, 15)).toBe('January 15');
      expect(formatBirthdayDate(12, 25)).toBe('December 25');
      expect(formatBirthdayDate(6, 1)).toBe('June 1');
    });

    it('includes year when provided', () => {
      expect(formatBirthdayDate(3, 20, 1990)).toBe('March 20, 1990');
    });

    it('omits year when null or undefined', () => {
      expect(formatBirthdayDate(7, 4, null)).toBe('July 4');
      expect(formatBirthdayDate(7, 4, undefined)).toBe('July 4');
    });
  });

  describe('isBirthdayToday', () => {
    it('returns true when birthday matches today', () => {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      expect(isBirthdayToday(month, day)).toBe(true);
    });

    it('returns false when birthday is not today', () => {
      // Use a date that definitely isn't today
      const today = new Date();
      const otherMonth = today.getMonth() === 0 ? 2 : 1;
      expect(isBirthdayToday(otherMonth, 1)).toBe(false);
    });
  });

  describe('getNextBirthday', () => {
    it('returns a Date object', () => {
      const result = getNextBirthday(6, 15);
      expect(result).toBeInstanceOf(Date);
    });

    it('returns a future or today date', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const result = getNextBirthday(6, 15);
      expect(result.getTime()).toBeGreaterThanOrEqual(today.getTime());
    });
  });

  describe('getDaysUntilBirthday', () => {
    it('returns 0 for today', () => {
      const today = new Date();
      expect(getDaysUntilBirthday(today.getMonth() + 1, today.getDate())).toBe(0);
    });

    it('returns a non-negative number', () => {
      expect(getDaysUntilBirthday(1, 1)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getAge', () => {
    it('returns null when birth year is null', () => {
      expect(getAge(null, 6, 15)).toBeNull();
    });

    it('returns null when birth year is undefined', () => {
      expect(getAge(undefined, 6, 15)).toBeNull();
    });

    it('returns a positive number when year is provided', () => {
      const age = getAge(1990, 6, 15);
      expect(age).not.toBeNull();
      expect(age!).toBeGreaterThan(0);
    });
  });
});
