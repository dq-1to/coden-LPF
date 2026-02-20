/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-mint': '#2CC295',
        'primary-dark': '#1E9E78',
        'secondary-bg': '#F0FDF9',
        'text-dark': '#1F2937',
        'text-light': '#6B7280',
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
        display: ['Nunito', 'sans-serif'],
      },
      backgroundImage: {
        'mint-gradient': 'linear-gradient(135deg, #2CC295 0%, #4FD1C5 100%)',
      },
      boxShadow: {
        glass: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
