import { colors } from './colors';
import { typography } from './typography';
import { spacing, breakpoints } from './spacing';

export { colors } from './colors';
export { typography } from './typography';
export { spacing, breakpoints } from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  breakpoints,
  
  // Component-specific themes
  components: {
    button: {
      primary: {
        background: colors.primary[500],
        color: colors.text.inverse,
        hover: colors.primary[600],
        focus: colors.primary[700],
      },
      secondary: {
        background: colors.background.primary,
        color: colors.text.primary,
        border: colors.border.primary,
        hover: colors.gray[50],
        focus: colors.primary[500],
      },
      ghost: {
        background: 'transparent',
        color: colors.text.primary,
        hover: colors.gray[100],
        focus: colors.primary[500],
      },
    },
    
    input: {
      background: colors.background.primary,
      border: colors.border.primary,
      focus: colors.border.focus,
      error: colors.error[500],
      placeholder: colors.text.tertiary,
    },
    
    card: {
      background: colors.background.primary,
      border: colors.border.primary,
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    },
    
    modal: {
      overlay: 'rgba(0, 0, 0, 0.5)',
      background: colors.background.primary,
      border: colors.border.primary,
    },
  },
} as const;

export type Theme = typeof theme;