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

// Spacing scale — use instead of picking arbitrary padding/margin numbers per screen.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

// Font-size scale, named by role rather than pixel value.
export const typography = {
  caption: 12,
  small: 13,
  body: 14,
  bodyLg: 16,
  subheading: 18,
  heading: 20,
  headingLg: 24,
  title: 28,
  display: 36,
} as const;
