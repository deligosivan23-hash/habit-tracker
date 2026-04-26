import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#04070D',
          900: '#080C14',
          800: '#0D1420',
          700: '#121B2D',
          600: '#1A2540',
          500: '#243050',
        },
        amber: {
          DEFAULT: '#F0A500',
          50: '#FEF9EC',
          100: '#FDF0C8',
          200: '#FAE08F',
          300: '#F7CB56',
          400: '#F4B72E',
          500: '#F0A500',
          600: '#C98200',
          700: '#A36200',
          800: '#7A4800',
          900: '#4F2F00',
        },
        surface: {
          DEFAULT: '#0D1420',
          raised: '#121B2D',
          overlay: '#1A2540',
        },
        border: {
          DEFAULT: '#1E2A40',
          subtle: '#141E30',
          bright: '#2A3D5A',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#4A5C72',
          accent: '#F0A500',
        },
        success: '#10B981',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
        'glow-amber': 'radial-gradient(ellipse at 50% 0%, rgba(240,165,0,0.12) 0%, transparent 60%)',
        'glow-blue': 'radial-gradient(ellipse at 50% 100%, rgba(59,130,246,0.08) 0%, transparent 60%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'tick': 'tick 1s steps(1) infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 8px rgba(240,165,0,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(240,165,0,0.6)' },
        },
        tick: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'amber': '0 0 20px rgba(240,165,0,0.25)',
        'amber-sm': '0 0 10px rgba(240,165,0,0.15)',
        'surface': '0 8px 32px rgba(0,0,0,0.4)',
        'card': '0 2px 16px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};

export default config;
