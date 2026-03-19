/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Sora', 'sans-serif'],
      },
      colors: {
        // Brand palette
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c2d3ff',
          300: '#94b0fd',
          400: '#6088fa',
          500: '#3b62f6',
          600: '#2545eb',
          700: '#1d35d8',
          800: '#1e2faf',
          900: '#1e2d8a',
          950: '#161d5a',
        },
        // Dark surface palette
        surface: {
          950: '#070b14',
          900: '#0d1220',
          850: '#111827',
          800: '#161f30',
          750: '#1a2640',
          700: '#1e2d4a',
          600: '#243555',
          500: '#2d4268',
        },
        // Accent
        accent: {
          cyan:   '#22d3ee',
          green:  '#4ade80',
          amber:  '#fbbf24',
          red:    '#f87171',
          purple: '#a78bfa',
        },
      },
      boxShadow: {
        'card':    '0 2px 20px rgba(0,0,0,0.35)',
        'card-lg': '0 8px 40px rgba(0,0,0,0.45)',
        'glow':    '0 0 24px rgba(59,98,246,0.35)',
        'glow-sm': '0 0 12px rgba(59,98,246,0.25)',
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'dot-pattern':  "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
