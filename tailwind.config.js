// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    "./renderer/**/*.{html,js}"
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
}