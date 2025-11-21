import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';


const AppTheme = {
  background: 'hsl(240 10% 4%)', // Desaturated for less eye strain
  foreground: 'hsl(240 10% 96%)',
  card: 'hsl(240 10% 9%)', // Slightly lighter dark gray for surfaces
  cardForeground: 'hsl(240 10% 96%)',
  popover: 'hsl(240 10% 9%)',
  popoverForeground: 'hsl(240 10% 96%)',
  primary: 'hsl(216 40% 50%)', // Slightly more saturated and lighter for better visibility
  primaryForeground: 'hsl(240 10% 96%)',
  secondary: 'hsl(240 6% 20%)', // Neutral gray for secondary
  secondaryForeground: 'hsl(240 10% 96%)',
  muted: 'hsl(240 5% 26%)', // Adjusted for better muted contrast
  mutedForeground: 'hsl(240 5% 65%)',
  accent: 'hsl(2 45% 65%)', // Desaturated orange to reduce vibration
  accentForeground: 'hsl(240 10% 96%)',
  destructive: 'hsl(0 62% 30%)', // Muted red for harmony in dark mode
  destructiveForeground: 'hsl(240 10% 96%)',
  border: 'hsl(240 6% 20%)', // Subtle border
  input: 'hsl(240 10% 9%)',
  ring: 'hsl(216 40% 50%)',
  radius: '0.625rem',
  chart1: 'hsl(0 72% 51%)', // Adjusted red
  chart2: 'hsl(24 60% 58%)', // Muted orange
  chart3: 'hsl(45 74% 62%)', // Soft yellow
  chart4: 'hsl(142 42% 45%)', // Desaturated green
  chart5: 'hsl(199 76% 59%)', // Blue
};

export const THEME = {
  light: AppTheme,
  dark: AppTheme,
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};