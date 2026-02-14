export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  bottomBarBackground: string;
  bottomBarBorder: string;
}

export type ThemeMode = 'light' | 'dark';

export const lightColors: ThemeColors = {
  background: '#FAF8F5',
  surface: '#F0EDE8',
  primary: '#E07A5F',
  textPrimary: '#2D2D2D',
  textSecondary: '#9E9E9E',
  accent: '#F2C94C',
  bottomBarBackground: '#FFFFFF',
  bottomBarBorder: '#E8E3DE',
};

export const darkColors: ThemeColors = {
  background: '#000000',
  surface: '#1A1A1A',
  primary: '#E07A5F',
  textPrimary: '#FFFFFF',
  textSecondary: '#6E6E6E',
  accent: '#F2C94C',
  bottomBarBackground: '#000000',
  bottomBarBorder: '#2A2A2A',
};
