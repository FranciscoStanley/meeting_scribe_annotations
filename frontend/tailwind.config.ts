import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#F3F5F7',
          muted: '#EAEFF3',
        },
        panel: '#FFFFFF',
        ink: {
          DEFAULT: '#0E1625',
          soft: '#243044',
        },
        muted: {
          DEFAULT: '#5A6A7A',
          soft: '#8A97A6',
        },
        hairline: '#E2E8EF',
        'hairline-strong': '#CBD5E1',
        brand: {
          DEFAULT: '#0F766E',
          ink: '#0A5C56',
          soft: '#CCFBF1',
          mist: '#F0FDFA',
        },
        live: {
          DEFAULT: '#B45309',
          soft: '#FEF3C7',
        },
        ok: {
          DEFAULT: '#047857',
          soft: '#D1FAE5',
        },
        danger: {
          DEFAULT: '#B91C1C',
          soft: '#FEE2E2',
        },
        accent: {
          DEFAULT: '#0F766E',
          soft: '#14B8A6',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(14, 22, 37, 0.04), 0 8px 24px rgba(14, 22, 37, 0.06)',
        lift: '0 12px 40px rgba(14, 22, 37, 0.1)',
      },
      backgroundImage: {
        atmosphere:
          'radial-gradient(1200px 600px at 10% -10%, rgba(15, 118, 110, 0.07), transparent 55%), radial-gradient(900px 500px at 100% 0%, rgba(14, 22, 37, 0.04), transparent 50%)',
      },
    },
  },
  plugins: [],
};

export default config;
