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
      expect(lightColors.background).toBe('#FFF8FE');
    });

    it('uses purple primary', () => {
      expect(lightColors.primary).toBe('#7145B5');
    });
  });

  describe('darkColors', () => {
    it.each(requiredKeys)('has %s defined', (key) => {
      expect(darkColors[key as keyof typeof darkColors]).toBeDefined();
      expect(typeof darkColors[key as keyof typeof darkColors]).toBe('string');
    });

    it('uses dark purple background', () => {
      expect(darkColors.background).toBe('#0E0620');
    });

    it('uses lighter purple primary for dark mode visibility', () => {
      expect(darkColors.primary).toBe('#A87EE0');
    });
  });
});
