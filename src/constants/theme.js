export const COLORS = {
  // Dark theme base
  background: '#0a0a1a',
  surface: '#12122a',
  surfaceLight: '#1a1a3a',
  surfaceElevated: '#22224a',

  // Accent colors
  keep: '#00E676',       // Vibrant green for KEEP
  keepGlow: 'rgba(0, 230, 118, 0.3)',
  delete: '#FF1744',     // Vibrant red for DELETE
  deleteGlow: 'rgba(255, 23, 68, 0.3)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textTertiary: 'rgba(255, 255, 255, 0.35)',

  // Gradient colors
  gradientStart: '#6C63FF',
  gradientMid: '#9C27B0',
  gradientEnd: '#E040FB',

  // Undo
  undo: '#FFD740',
  undoGlow: 'rgba(255, 215, 64, 0.25)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  counter: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -2,
  },
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  button: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};
