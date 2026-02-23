/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        accent: '#ec4899',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        cyber: '#00ff88',
        // Dark theme colors
        dark: {
          bg: '#0a0a0f',
          card: '#16161f',
          border: 'rgba(255,255,255,0.08)',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1, #ec4899)',
        'gradient-cyber': 'linear-gradient(135deg, #00ff88, #ff0088)',
        'gradient-glass': 'linear-gradient(135deg, #00d4ff, #a855f7)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'pulse-slow': 'pulse 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'recording': 'recording 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        recording: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(239,68,68,0.4)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 20px rgba(239,68,68,0)' },
        },
      },
      boxShadow: {
        'glow': '0 0 30px rgba(99,102,241,0.3)',
        'glow-pink': '0 0 30px rgba(236,72,153,0.3)',
        'glow-cyber': '0 0 30px rgba(0,255,136,0.3)',
      },
    },
  },
  plugins: [],
}
