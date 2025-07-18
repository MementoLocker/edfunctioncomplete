/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'dusty': {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#8FA3AD',
          700: '#6B7B8A',
          800: '#475569',
          900: '#334155'
        },
        'sepia': {
          50: '#FDF8F0',
          100: '#F9F1E6',
          200: '#F3E8D3',
          300: '#E6D5B7',
          400: '#D4C4A8',
          500: '#C2B299',
          600: '#B08D57',
          700: '#8B6914',
          800: '#6B5B47',
          900: '#4A4037'
        },
        'cream': {
          50: '#FEFCF8',
          100: '#FDF8F0',
          200: '#FAF0E6',
          300: '#F5E6D3',
          400: '#E8D5B7',
          500: '#DCC4A0',
          600: '#C8A882',
          700: '#B08D57',
          800: '#8B6914',
          900: '#6B5B47'
        }
      },
      fontFamily: {
        'serif': ['Lora', 'serif'],
        'sans': ['Lato', 'sans-serif']
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem'
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 1s ease-out',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        pulseGlow: {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: '0.1'
          },
          '50%': { 
            transform: 'scale(1.1)',
            opacity: '0.2'
          }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
};