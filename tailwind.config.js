/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        love: {
          light: '#ffb6c1',
          DEFAULT: '#ff69b4',
          dark: '#ff1493',
        },
        dream: {
          light: '#e0c3fc',
          DEFAULT: '#c084fc',
          dark: '#a855f7',
        },
      },
      animation: {
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pop-in': 'popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        popIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-love': 'linear-gradient(135deg, #ffb6c1 0%, #ff69b4 50%, #c084fc 100%)',
        'gradient-dream': 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
