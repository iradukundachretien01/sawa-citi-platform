/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EAF7EF',
          100: '#D8F0D8',
          200: '#B6E3C2',
          300: '#8AD0A1',
          400: '#4FB878',
          500: '#1B9A55',
          600: '#0F8A3C',
          700: '#0A5C3A',
          800: '#08492E',
          900: '#063A25',
          DEFAULT: '#0F8A3C',
        },
        accent: {
          50: '#FFF9E6',
          100: '#FFF1BF',
          200: '#FFE58A',
          300: '#FFD84D',
          400: '#F5C518',
          500: '#E0A800',
          600: '#B88600',
          DEFAULT: '#F5C518',
        },
        cream: '#F7F5EF',
        ink: '#111827',
        muted: '#4B5563',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(15, 138, 60, 0.08)',
        lift: '0 14px 40px rgba(15, 138, 60, 0.16)',
        nav: '0 2px 16px rgba(17, 24, 39, 0.06)',
      },
      maxWidth: {
        page: '1280px',
      },
      transitionDuration: {
        250: '250ms',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'slide-in': 'slide-in 0.28s ease-out both',
        'fade-in': 'fade-in 0.2s ease-out both',
      },
    },
  },
  plugins: [],
}
