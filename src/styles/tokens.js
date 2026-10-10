/**
 * Optimum Digital Works (ODW) Design System Tokens
 * Source of truth: src/assets/Optimum logo.jpg
 */

export const ODW_THEME = {
  colors: {
    primary: {
      DEFAULT: '#EF520B',
      hover: '#D94504',
      soft: '#FFF7ED',
    },
    charcoal: {
      DEFAULT: '#1E2229',
      light: '#2C323F',
    },
    neutral: {
      white: '#FFFFFF',
      background: '#F8FAFC',
      card: '#FFFFFF',
      border: '#E2E8F0',
      textPrimary: '#0F172A',
      textMuted: '#64748B',
      textSubtle: '#94A3B8',
    },
    semantic: {
      success: {
        DEFAULT: '#10B981',
        soft: '#ECFDF5',
        border: '#A7F3D0',
      },
      warning: {
        DEFAULT: '#F59E0B',
        soft: '#FFFBEB',
        border: '#FDE68A',
      },
      error: {
        DEFAULT: '#EF4444',
        soft: '#FEF2F2',
        border: '#FECACA',
      },
      info: {
        DEFAULT: '#0284C7',
        soft: '#F0F9FF',
        border: '#BAE6FD',
      },
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  shadows: {
    subtle: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
    card: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
    elevated: '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
  },
}

export default ODW_THEME
