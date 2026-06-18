/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        deepsea: {
          50: '#E8EFF8',
          100: '#C7D8EE',
          200: '#8FB0DD',
          300: '#4F7FC5',
          400: '#2A5A9E',
          500: '#1B3F74',
          600: '#143360',
          700: '#0F2C4E',
          800: '#0B2038',
          900: '#071626',
        },
        alert: {
          watch: '#1B9AAA',
          warn: '#FF6B35',
          escalate: '#D72638',
        },
        accent: {
          gold: '#E9B44C',
        },
        surface: {
          DEFAULT: '#F4F6F8',
          dark: '#2C3E50',
        }
      },
      fontFamily: {
        sans: ['"Source Han Sans SC"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        serif: ['"Source Han Serif SC"', '"Noto Serif SC"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 4px 14px -2px rgba(15, 44, 78, 0.08), 0 2px 6px -2px rgba(15, 44, 78, 0.06)',
        'card-hover': '0 12px 32px -4px rgba(15, 44, 78, 0.15), 0 4px 12px -4px rgba(15, 44, 78, 0.1)',
        'inner-glow-blue': 'inset 0 1px 0 0 rgba(27, 154, 170, 0.15)',
        'inner-glow-orange': 'inset 0 1px 0 0 rgba(255, 107, 53, 0.15)',
        'inner-glow-red': 'inset 0 1px 0 0 rgba(215, 38, 56, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up-in': 'slideUpIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'breathe': 'breathe 2s ease-in-out infinite',
        'spin-once': 'spin 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        slideUpIn: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.08)' },
        },
      },
    },
  },
  plugins: [],
};
