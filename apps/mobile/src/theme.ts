// Single source of truth for app colors. Change a brand color here, not in 11 screens.
export const colors = {
  // Brand greens
  primary: '#2d6a4f',
  primaryDark: '#1b4332',
  cardBg: '#f0faf4',
  cardBorder: '#b7e4c7',
  successBg: '#d8f3dc',

  // Neutrals (light → dark)
  white: '#fff',
  divider: '#eee',
  inputBorder: '#ddd',
  borderLight: '#ccc',
  placeholder: '#999',
  textFaint: '#888',
  textSubtle: '#666',
  textMuted: '#555',
  disabled: '#adb5bd',

  // Status
  warning: '#ff9800',
  warningBg: '#fff8f0',
  warningBgAlt: '#fff3e0',
  danger: '#ff4444',
} as const;
