/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lpr: {
          navy:  '#1A2E4A',
          blue:  '#2563EB',
          light: '#E6F1FB',
        }
      }
    },
  },
  plugins: [],
}