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
  background: '#FFF8FE',
  surface: '#F2E8FF',
  primary: '#7145B5',
  textPrimary: '#1E0A35',
  textSecondary: '#9480B8',
  accent: '#F5A0B0',
  bottomBarBackground: '#FFFFFF',
  bottomBarBorder: '#EDE0FF',
};

export const darkColors: ThemeColors = {
  background: '#0E0620',
  surface: '#1D1040',
  primary: '#A87EE0',
  textPrimary: '#F5F0FF',
  textSecondary: '#9B88C0',
  accent: '#F5A0B0',
  bottomBarBackground: '#100825',
  bottomBarBorder: '#2D1A55',
};
