import { lightColors, darkColors } from '../theme';

describe('theme', () => {
  const requiredKeys = [
    'background',
    'surface',
    'primary',
    'textPrimary',
    'textSecondary',
    'accent',
    'bottomBarBackground',
    'bottomBarBorder',
  ];

  describe('lightColors', () => {
    it.each(requiredKeys)('has %s defined', (key) => {
      expect(lightColors[key as keyof typeof lightColors]).toBeDefined();
      expect(typeof lightColors[key as keyof typeof lightColors]).toBe('string');
    });

    it('uses warm background', () => {
      expect(lightColors.background).toBe('#FAF8F5');
    });

    it('uses coral primary', () => {
      expect(lightColors.primary).toBe('#E07A5F');
    });
  });

  describe('darkColors', () => {
    it.each(requiredKeys)('has %s defined', (key) => {
      expect(darkColors[key as keyof typeof darkColors]).toBeDefined();
      expect(typeof darkColors[key as keyof typeof darkColors]).toBe('string');
    });

    it('uses black background', () => {
      expect(darkColors.background).toBe('#000000');
    });

    it('shares same primary as light mode', () => {
      expect(darkColors.primary).toBe(lightColors.primary);
    });
  });
});
