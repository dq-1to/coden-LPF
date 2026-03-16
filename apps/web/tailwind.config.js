import typography from '@tailwindcss/typography'

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
        mono: ['"Fira Code"', '"JetBrains Mono"', 'Consolas', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      backgroundImage: {
        'mint-gradient': 'linear-gradient(135deg, #2CC295 0%, #4FD1C5 100%)',
      },
      boxShadow: {
        glass: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-links': '#1E9E78',
            '--tw-prose-bold': '#1E9E78',
            'h2': {
              borderLeft: '4px solid #2CC295',
              paddingLeft: '0.75rem',
              marginTop: '2.5rem',
              marginBottom: '1rem',
            },
            'h3': {
              marginTop: '2rem',
              marginBottom: '0.75rem',
            },
            'strong': {
              color: '#1E9E78',
            },
            'a': {
              color: '#1E9E78',
              textDecoration: 'underline',
              '&:hover': {
                color: '#2CC295',
              },
            },
            'pre': {
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
}
