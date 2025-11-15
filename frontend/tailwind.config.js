const tokens = require('./src/theme/tokens.json');

const { palette, typography, shadows } = tokens;

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: palette.canvas.base,
          light: palette.canvas.light,
          lighter: palette.canvas.lighter,
        },
        primary: {
          DEFAULT: palette.primary.base,
          light: palette.primary.light,
          dark: palette.primary.dark,
          glow: palette.primary.glow,
        },
        success: {
          DEFAULT: palette.success.base,
          light: palette.success.light,
          dark: palette.success.dark,
          glow: palette.success.glow,
        },
        danger: {
          DEFAULT: palette.danger.base,
          light: palette.danger.light,
          dark: palette.danger.dark,
          glow: palette.danger.glow,
        },
        warning: {
          DEFAULT: palette.warning.base,
          light: palette.warning.light,
          dark: palette.warning.dark,
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.3)',
        },
        text: {
          primary: palette.text.primary,
          secondary: palette.text.secondary,
          muted: palette.text.muted,
        },
      },
      fontFamily: {
        sans: typography.sans,
        mono: typography.mono,
      },
      fontSize: {
        'financial': '0.95rem', // Optimal for tabular numbers
      },
      fontVariantNumeric: {
        'tabular': 'tabular-nums',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glow-primary': shadows.glowPrimary,
        'glow-success': shadows.glowSuccess,
        'glow-danger': shadows.glowDanger,
        'glass': shadows.glass,
        'elevated': shadows.elevated,
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-right': 'slideRight 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(29, 122, 243, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(29, 122, 243, 0.6)' },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1D7AF3 0%, #0D5AC2 100%)',
        'gradient-success': 'linear-gradient(135deg, #04AA6D 0%, #038A57 100%)',
        'gradient-danger': 'linear-gradient(135deg, #FF4500 0%, #CC3700 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
      backgroundColor: ['active', 'disabled'],
      textColor: ['active', 'disabled'],
      scale: ['active'],
    },
  },
  plugins: [],
}