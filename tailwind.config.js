/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './site/index.html',
    './site/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eef3ef',
          100: '#d6e3da',
          200: '#aac6b5',
          300: '#78a28b',
          400: '#4a7d63',
          500: '#2f6049',
          600: '#234c3a',
          700: '#1d3d30',
          800: '#162e24',
          900: '#0f2019',
          950: '#09140f',
        },
        brass: {
          100: '#f7f1e3',
          200: '#e6d4ac',
          300: '#d4b982',
          400: '#c2a064',
          500: '#b08d57',
          600: '#8f6f3c',
          700: '#6f5428',
        },
        ivory: {
          50: '#fcfaf5',
          100: '#f7f2e7',
          200: '#ede5d1',
          300: '#ded3b9',
        },
        charcoal: {
          700: '#34363a',
          800: '#232528',
          900: '#17181a',
        },
        brand: {
          50: '#eef3ef',
          100: '#d6e3da',
          200: '#aac6b5',
          300: '#78a28b',
          400: '#4a7d63',
          500: '#2f6049',
          600: '#234c3a',
          700: '#1d3d30',
          800: '#162e24',
          900: '#0f2019',
          950: '#09140f',
        },
      },
    },
  },
  plugins: [],
};
