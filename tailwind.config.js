/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.razor', './wwwroot/**/*.html'],
  theme: {
    extend: {
      colors: {
        accent: '#0b57d0',
      },
    },
  },
  plugins: [],
};
