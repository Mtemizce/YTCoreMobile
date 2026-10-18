import { useColorScheme } from 'react-native';

export function useTheme(accent?: string | null) {
  const dark = useColorScheme() === 'dark';
  return {
    dark,
    bg: dark ? '#0f1115' : '#f4f5f8',
    card: dark ? '#1a1d24' : '#ffffff',
    text: dark ? '#f1f3f7' : '#14161c',
    muted: dark ? '#9aa3b2' : '#5b6472',
    border: dark ? '#2a2f3a' : '#e2e5ec',
    accent: accent && /^#[0-9a-f]{6}$/i.test(accent) ? accent : '#4f46e5',
    danger: '#dc2626',
  };
}
