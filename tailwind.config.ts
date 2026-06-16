import type { Config } from 'tailwindcss';

/**
 * Design tokens « laboratoire premium + interface clinique ».
 * Palette froide et désaturée : bleu nuit (fond), bleu clinique, cyan/teal médical,
 * soupçon de violet « neuro ». Aucune couleur flashy, aucun doré.
 * Les valeurs sont dupliquées en CSS variables dans src/styles/tokens.css
 * (utilisées par le canvas et certains effets) — garder les deux synchronisés.
 */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        night: {
          900: '#070B14',
          800: '#0B1120',
          700: '#0F1828',
          600: '#152138',
          500: '#1D2C46',
        },
        paper: '#F4F7FB',
        card: '#FFFFFF',
        ink: {
          900: '#0E1726',
          700: '#243246',
          500: '#51617A',
          400: '#7C8AA0',
        },
        clinical: {
          700: '#234A8C',
          600: '#2C56A0',
          500: '#3568BE',
          400: '#5B86D0',
        },
        teal: {
          700: '#0E6B75',
          600: '#127E89',
          500: '#19A2B0',
          400: '#34C5D3',
          300: '#7FE0E9',
        },
        neuro: {
          500: '#7B72C7',
          400: '#9A92D8',
        },
        line: '#E2E8F2',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        soft: '0 26px 50px -34px rgba(20,40,80,.45)',
        instrument: '0 40px 80px -50px rgba(20,40,80,.55), 0 1px 0 rgba(255,255,255,.8) inset',
        glow: '0 0 0 1px rgba(25,162,176,.45), 0 16px 36px -16px rgba(25,162,176,.6)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)', opacity: '0.6' },
          '50%': { transform: 'translateY(7px)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up .8s cubic-bezier(.2,.7,.2,1) both',
        floaty: 'floaty 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
