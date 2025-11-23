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
        corporate: {
          primary: '#1e3a8a',
          secondary: '#3b82f6',
          accent: '#60a5fa',
          dark: '#0f172a',
          light: '#f1f5f9',
        }
      }
    },
  },
  plugins: [],
}
