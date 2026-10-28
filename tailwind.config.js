/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2463eb',
          'blue-light': '#dceaff',
          'blue-hover': '#1d4fd8',
          ink: '#101827',
          muted: '#65748b',
          line: '#d2dce9',
          page: '#f7f9fc',
          green: '#20b36b',
          'green-light': '#d1fae9',
          purple: '#a855f7',
          'purple-light': '#f6efff',
        }
      },
      borderRadius: {
        'portal': '21px',
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
